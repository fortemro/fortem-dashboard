import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Edit, Mail, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: any;
}

interface ItemComanda {
  id: string;
  cantitate: number;
  pret_unitar: number;
  total_item: number;
  produs_id: string;
  produs?: {
    id: string;
    nume: string;
    dimensiuni: string;
  };
}

export function OrderDetailsModal({ isOpen, onClose, comanda }: OrderDetailsModalProps) {
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && comanda?.id) {
      fetchOrderItems();
    }
  }, [isOpen, comanda?.id]);

  const fetchOrderItems = async () => {
    if (!comanda?.id) return;

    setLoading(true);
    try {
      // First get the items
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('*')
        .eq('comanda_id', comanda.id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      // Then get product details for each item
      const itemsWithProducts = await Promise.all(
        (itemsData || []).map(async (item) => {
          const { data: productData, error: productError } = await supabase
            .from('produse')
            .select('id, nume, dimensiuni')
            .eq('id', item.produs_id)
            .single();

          if (productError) {
            console.error('Error fetching product for item:', item.id, productError);
          }

          return {
            ...item,
            produs: productData || undefined
          };
        })
      );

      setItems(itemsWithProducts);
    } catch (error) {
      console.error('Error loading order items:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca produsele comenzii",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'in_asteptare': { label: 'În Așteptare', variant: 'secondary' as const },
      'procesare': { label: 'În Procesare', variant: 'default' as const },
      'expediere': { label: 'În Expediere', variant: 'default' as const },
      'finalizata': { label: 'Finalizată', variant: 'default' as const },
      'anulata': { label: 'Anulată', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const copyOrderNumber = () => {
    navigator.clipboard.writeText(comanda.numar_comanda);
    toast({
      title: "Copiat",
      description: "Numărul comenzii a fost copiat în clipboard"
    });
  };

  const handleDuplicateOrder = () => {
    // Store order data for duplication including real items
    localStorage.setItem('duplicateOrderData', JSON.stringify({
      distribuitor_id: comanda.distribuitor_id,
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      judet_livrare: comanda.judet_livrare,
      telefon_livrare: comanda.telefon_livrare,
      observatii: comanda.observatii,
      items: items.map(item => ({
        produs_id: item.produs?.id,
        nume_produs: item.produs?.nume,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar
      }))
    }));
    
    navigate('/comanda');
    onClose();
    toast({
      title: "Template creat",
      description: "Formularul a fost pre-completat cu datele și produsele comenzii"
    });
  };

  const handleEditOrder = () => {
    // Store order data for editing
    localStorage.setItem('editOrderData', JSON.stringify({
      id: comanda.id,
      distribuitor_id: comanda.distribuitor_id,
      oras_livrare: comanda.oras_livrare,
      adresa_livrare: comanda.adresa_livrare,
      judet_livrare: comanda.judet_livrare,
      telefon_livrare: comanda.telefon_livrare,
      observatii: comanda.observatii,
      items: items.map(item => ({
        produs_id: item.produs?.id,
        nume_produs: item.produs?.nume,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar
      }))
    }));
    
    navigate(`/comanda?edit=${comanda.id}`);
    onClose();
    toast({
      title: "Editare comandă",
      description: "Formularul a fost încărcat pentru editare"
    });
  };

  const totalComanda = items.reduce((sum, item) => sum + item.total_item, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalii Comandă #{comanda.numar_comanda}</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={copyOrderNumber}>
                <Copy className="h-4 w-4" />
              </Button>
              {getStatusBadge(comanda.status)}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informații Comandă</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Număr:</span>
                  <span className="font-mono">{comanda.numar_comanda}</span>
                  
                  <span className="font-medium">Data:</span>
                  <span>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</span>
                  
                  <span className="font-medium">Status:</span>
                  <span>{getStatusBadge(comanda.status)}</span>
                  
                  <span className="font-medium">Distribuitor:</span>
                  <span className="font-medium">{comanda.distribuitor_id}</span>
                  
                  <span className="font-medium">Paleti Total:</span>
                  <span>{comanda.calculated_paleti || comanda.numar_paleti}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detalii Livrare</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="font-medium">Oraș:</span>
                  <span>{comanda.oras_livrare}</span>
                  
                  <span className="font-medium">Adresă:</span>
                  <span>{comanda.adresa_livrare}</span>
                  
                  {comanda.judet_livrare && (
                    <>
                      <span className="font-medium">Județ:</span>
                      <span>{comanda.judet_livrare}</span>
                    </>
                  )}
                  
                  {comanda.telefon_livrare && (
                    <>
                      <span className="font-medium">Telefon:</span>
                      <span>{comanda.telefon_livrare}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produse Comandate</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Se încarcă produsele...</p>
                </div>
              ) : items.length > 0 ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produs</TableHead>
                        <TableHead>Dimensiuni</TableHead>
                        <TableHead className="text-right">Cantitate (Paleti)</TableHead>
                        <TableHead className="text-right">Preț/Palet</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.produs?.nume || 'N/A'}</TableCell>
                          <TableCell>{item.produs?.dimensiuni || 'N/A'}</TableCell>
                          <TableCell className="text-right">{item.cantitate}</TableCell>
                          <TableCell className="text-right">{item.pret_unitar.toFixed(2)} RON</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.total_item.toFixed(2)} RON
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">Total Comandă:</span>
                      <span className="text-xl font-bold text-green-600">
                        {totalComanda.toFixed(2)} RON
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Nu au fost găsite produse pentru această comandă</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observatii */}
          {comanda.observatii && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Observații</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{comanda.observatii}</p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <div className="flex gap-2">
              {comanda.status === 'in_asteptare' && (
                <Button variant="outline" onClick={handleEditOrder}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editează
                </Button>
              )}
              <Button variant="outline" onClick={handleDuplicateOrder}>
                <Copy className="h-4 w-4 mr-2" />
                Duplică
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" disabled>
                <Mail className="h-4 w-4 mr-2" />
                Retrimite Email
              </Button>
              <Button variant="outline" disabled>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
