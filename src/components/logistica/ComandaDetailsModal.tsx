
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useComandaDetails } from '@/hooks/comenzi/useComandaDetails';
import type { Comanda } from '@/types/comanda';

interface ComandaDetailsModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ComandaDetailsModal({ comanda, isOpen, onClose }: ComandaDetailsModalProps) {
  const { getComandaById } = useComandaDetails();
  const [comandaDetails, setCombandaDetails] = useState<Comanda | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadComandaDetails = async () => {
      if (comanda?.id && isOpen) {
        setLoading(true);
        try {
          const details = await getComandaById(comanda.id);
          setCombandaDetails(details);
        } catch (error) {
          console.error('Error loading comanda details:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadComandaDetails();
  }, [comanda?.id, isOpen, getComandaById]);

  if (!isOpen || !comanda) return null;

  const detailsToShow = comandaDetails || comanda;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalii Comandă #{detailsToShow.numar_comanda}</DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informații generale */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informații Generale</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Număr Comandă</label>
                  <p className="font-medium">{detailsToShow.numar_comanda}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {detailsToShow.status || 'in_asteptare'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Dată Plasare</label>
                  <p>{format(new Date(detailsToShow.data_comanda), 'dd.MM.yyyy HH:mm')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Paleti</label>
                  <p>{detailsToShow.numar_paleti || 0}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Comandă</label>
                  <p>{detailsToShow.total_comanda || 0} RON</p>
                </div>
                {detailsToShow.mzv_emitent && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">MZV Emitent</label>
                    <p>{detailsToShow.mzv_emitent}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informații distribuitor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Distribuitor</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Nume Companie</label>
                  <p>{detailsToShow.distribuitor?.nume_companie || detailsToShow.distribuitor_id}</p>
                </div>
                {detailsToShow.distribuitor?.persoana_contact && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Persoana Contact</label>
                    <p>{detailsToShow.distribuitor.persoana_contact}</p>
                  </div>
                )}
                {detailsToShow.distribuitor?.telefon && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon</label>
                    <p>{detailsToShow.distribuitor.telefon}</p>
                  </div>
                )}
                {detailsToShow.distribuitor?.email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p>{detailsToShow.distribuitor.email}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informații livrare */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informații Livrare</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Orașul Livrare</label>
                  <p>{detailsToShow.oras_livrare}</p>
                </div>
                {detailsToShow.judet_livrare && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Județ</label>
                    <p>{detailsToShow.judet_livrare}</p>
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">Adresa Livrare</label>
                  <p>{detailsToShow.adresa_livrare}</p>
                </div>
                {detailsToShow.telefon_livrare && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefon Livrare</label>
                    <p>{detailsToShow.telefon_livrare}</p>
                  </div>
                )}
                {detailsToShow.observatii && (
                  <div className="col-span-2">
                    <label className="text-sm font-medium text-gray-500">Observații</label>
                    <p>{detailsToShow.observatii}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informații transport */}
            {(detailsToShow.data_expediere || detailsToShow.nume_transportator || detailsToShow.awb) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informații Transport</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  {detailsToShow.data_expediere && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Data Expediere</label>
                      <p>{format(new Date(detailsToShow.data_expediere), 'dd.MM.yyyy HH:mm')}</p>
                    </div>
                  )}
                  {detailsToShow.nume_transportator && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Transportator</label>
                      <p>{detailsToShow.nume_transportator}</p>
                    </div>
                  )}
                  {detailsToShow.awb && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">AWB</label>
                      <p>{detailsToShow.awb}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Produse comandate */}
            {detailsToShow.items && detailsToShow.items.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Produse Comandate</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produs</TableHead>
                        <TableHead>Dimensiuni</TableHead>
                        <TableHead>Cantitate</TableHead>
                        <TableHead>Preț Unitar</TableHead>
                        <TableHead>Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detailsToShow.items.map((item, index) => (
                        <TableRow key={item.id || index}>
                          <TableCell>{item.produs?.nume || 'Produs necunoscut'}</TableCell>
                          <TableCell>{item.produs?.dimensiuni || '-'}</TableCell>
                          <TableCell>{item.cantitate}</TableCell>
                          <TableCell>{item.pret_unitar} RON</TableCell>
                          <TableCell>{(item.cantitate * item.pret_unitar).toFixed(2)} RON</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
