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
import { ResendEmailDialog } from './ResendEmailDialog';

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
    bucati_per_palet: number;
  };
}

export function OrderDetailsModal({ isOpen, onClose, comanda }: OrderDetailsModalProps) {
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [loading, setLoading] = useState(false);
  const [distributorName, setDistributorName] = useState('');
  const [exportingPdf, setExportingPdf] = useState(false);
  const [showResendEmailDialog, setShowResendEmailDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && comanda?.id) {
      fetchOrderItems();
      loadDistributorName();
    }
  }, [isOpen, comanda?.id]);

  const loadDistributorName = async () => {
    if (!comanda?.distribuitor_id) return;

    // Check if distribuitor_id is a UUID (new format) or text (old format)
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
    
    if (isUUID) {
      try {
        const { data: distributorData, error } = await supabase
          .from('distribuitori')
          .select('nume_companie')
          .eq('id', comanda.distribuitor_id)
          .single();

        if (!error && distributorData) {
          setDistributorName(distributorData.nume_companie);
        } else {
          setDistributorName(comanda.distribuitor_id);
        }
      } catch (error) {
        console.error('Error loading distributor name:', error);
        setDistributorName(comanda.distribuitor_id);
      }
    } else {
      // Old format - distribuitor_id is already the name
      setDistributorName(comanda.distribuitor_id);
    }
  };

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
            .select('id, nume, dimensiuni, bucati_per_palet')
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
    // Store order data for duplication including real items with distribuitor_name
    localStorage.setItem('duplicateOrderData', JSON.stringify({
      distribuitor_id: comanda.distribuitor_id,
      distribuitor_name: distributorName, // Adăugat distribuitor_name pentru a fi folosit în FormInitializer
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
      distribuitor_name: distributorName, // Adăugat și aici pentru consistență
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

  const handleExportPdf = () => {
    setExportingPdf(true);
    try {
      // Create a printable version
      const printContent = `
        <html>
          <head>
            <title>Comandă ${comanda.numar_comanda}</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #333;
              }
              .header { 
                text-align: center; 
                border-bottom: 2px solid #2c5aa0; 
                padding-bottom: 20px; 
                margin-bottom: 30px;
              }
              .order-info { 
                display: grid; 
                grid-template-columns: 1fr 1fr; 
                gap: 20px; 
                margin-bottom: 30px;
              }
              .section { 
                border: 1px solid #ddd; 
                padding: 15px; 
                border-radius: 5px;
              }
              .section h3 { 
                margin-top: 0; 
                color: #2c5aa0;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 20px 0;
              }
              th, td { 
                border: 1px solid #ddd; 
                padding: 10px; 
                text-align: left;
              }
              th { 
                background-color: #f2f2f2; 
                font-weight: bold;
              }
              .total { 
                background-color: #f9f9f9; 
                border-left: 4px solid #2c5aa0; 
                padding: 15px; 
                margin-top: 20px; 
                text-align: right;
              }
              @media print {
                body { margin: 0; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>COMANDĂ #${comanda.numar_comanda}</h1>
              <p>Data: ${new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</p>
            </div>
            
            <div class="order-info">
              <div class="section">
                <h3>Informații Comandă</h3>
                <p><strong>Număr:</strong> ${comanda.numar_comanda}</p>
                <p><strong>Data:</strong> ${new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</p>
                <p><strong>Status:</strong> ${comanda.status}</p>
                <p><strong>Distribuitor:</strong> ${distributorName || comanda.distribuitor_id}</p>
                <p><strong>Paleti Total:</strong> ${comanda.calculated_paleti || comanda.numar_paleti}</p>
              </div>
              
              <div class="section">
                <h3>Detalii Livrare</h3>
                <p><strong>Oraș:</strong> ${comanda.oras_livrare}</p>
                <p><strong>Adresă:</strong> ${comanda.adresa_livrare}</p>
                ${comanda.judet_livrare ? `<p><strong>Județ:</strong> ${comanda.judet_livrare}</p>` : ''}
                ${comanda.telefon_livrare ? `<p><strong>Telefon:</strong> ${comanda.telefon_livrare}</p>` : ''}
              </div>
            </div>

            <div class="section">
              <h3>Produse Comandate</h3>
              <table>
                <thead>
                  <tr>
                    <th>Produs</th>
                    <th>Dimensiuni</th>
                    <th>Cantitate (Paleti)</th>
                    <th>Preț/Palet</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${items.map(item => `
                    <tr>
                      <td>${item.produs?.nume || 'N/A'}</td>
                      <td>${item.produs?.dimensiuni || 'N/A'}</td>
                      <td style="text-align: right;">${item.cantitate}</td>
                      <td style="text-align: right;">${item.pret_unitar.toFixed(2)} RON</td>
                      <td style="text-align: right;">${item.total_item.toFixed(2)} RON</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>

            <div class="total">
              <h2>Total Comandă: ${items.reduce((sum, item) => sum + item.total_item, 0).toFixed(2)} RON</h2>
            </div>

            ${comanda.observatii ? `
              <div class="section">
                <h3>Observații</h3>
                <p>${comanda.observatii}</p>
              </div>
            ` : ''}
          </body>
        </html>
      `;

      // Open print dialog
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }

      toast({
        title: "Export PDF",
        description: "Dialogul de printare a fost deschis pentru a salva comanda ca PDF"
      });
    } catch (error: any) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Eroare la export PDF",
        description: "Nu s-a putut deschide dialogul de printare",
        variant: "destructive"
      });
    } finally {
      setExportingPdf(false);
    }
  };

  const totalComanda = items.reduce((sum, item) => sum + item.total_item, 0);

  return (
    <>
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
                    <span className="font-medium">{distributorName || comanda.distribuitor_id}</span>
                    
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
                <Button 
                  variant="outline" 
                  onClick={() => setShowResendEmailDialog(true)}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Retrimite Email
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportingPdf ? 'Se exportă...' : 'Export PDF'}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ResendEmailDialog
        isOpen={showResendEmailDialog}
        onClose={() => setShowResendEmailDialog(false)}
        comanda={comanda}
      />
    </>
  );
}
