
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Comanda } from '@/types/comanda';

interface ProduseComenziModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
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

export function ProduseComenziModal({ comanda, isOpen, onClose }: ProduseComenziModalProps) {
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && comanda?.id) {
      fetchOrderItems();
    }
  }, [isOpen, comanda?.id]);

  const fetchOrderItems = async () => {
    if (!comanda?.id) return;

    setLoading(true);
    try {
      // Get the items
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('*')
        .eq('comanda_id', comanda.id);

      if (itemsError) {
        console.error('Error fetching order items:', itemsError);
        throw itemsError;
      }

      // Get product details for each item
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
    } finally {
      setLoading(false);
    }
  };

  const totalPaleti = items.reduce((sum, item) => sum + item.cantitate, 0);
  const totalBucati = items.reduce((sum, item) => {
    const bucatiPerPalet = item.produs?.bucati_per_palet || 0;
    return sum + (item.cantitate * bucatiPerPalet);
  }, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Produse Comandă #{comanda?.numar_comanda}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Sumar rapid */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                <div className="text-sm text-gray-600">Tipuri Produse</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{totalPaleti}</div>
                <div className="text-sm text-gray-600">Total Paleti</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{totalBucati.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Bucăți</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabelul cu produsele */}
          <Card>
            <CardContent className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-500">Se încarcă produsele...</p>
                </div>
              ) : items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Produs</TableHead>
                      <TableHead>Dimensiuni</TableHead>
                      <TableHead className="text-right">Paleti</TableHead>
                      <TableHead className="text-right">Buc/Palet</TableHead>
                      <TableHead className="text-right">Total Bucăți</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.produs?.nume || 'Produs necunoscut'}
                        </TableCell>
                        <TableCell>
                          {item.produs?.dimensiuni || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {item.cantitate}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.produs?.bucati_per_palet || 'N/A'}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {((item.produs?.bucati_per_palet || 0) * item.cantitate).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nu au fost găsite produse pentru această comandă</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
