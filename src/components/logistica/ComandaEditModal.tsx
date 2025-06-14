
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { useComandaDetails } from '@/hooks/comenzi/useComandaDetails';
import { useComandaEdit } from '@/hooks/logistica/useComandaEdit';
import type { Comanda } from '@/types/comanda';

interface ComandaEditModalProps {
  comanda: Comanda | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function ComandaEditModal({ comanda, isOpen, onClose, onSuccess }: ComandaEditModalProps) {
  const { getComandaById } = useComandaDetails();
  const { updateComandaTransport, loading } = useComandaEdit();
  const [comandaDetails, setCombandaDetails] = useState<Comanda | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [awb, setAwb] = useState('');
  const [numeTransportator, setNumeTransportator] = useState('');

  useEffect(() => {
    const loadComandaDetails = async () => {
      if (comanda?.id && isOpen && !comandaDetails) { // Add check to prevent reload if already loaded
        setLoadingDetails(true);
        try {
          const details = await getComandaById(comanda.id);
          setCombandaDetails(details);
          setAwb(details.awb || '');
          setNumeTransportator(details.nume_transportator || '');
        } catch (error) {
          console.error('Error loading comanda details:', error);
          // Set the current comanda as fallback to prevent infinite loading
          setCombandaDetails(comanda);
          setAwb(comanda.awb || '');
          setNumeTransportator(comanda.nume_transportator || '');
        } finally {
          setLoadingDetails(false);
        }
      }
    };

    if (isOpen && comanda) {
      loadComandaDetails();
    } else if (!isOpen) {
      // Reset state when modal is closed
      setCombandaDetails(null);
      setAwb('');
      setNumeTransportator('');
    }
  }, [comanda?.id, isOpen, getComandaById]); // Remove comandaDetails from dependencies to prevent loops

  const handleSave = async () => {
    if (!comanda?.id) return;
    
    const success = await updateComandaTransport(comanda.id, awb, numeTransportator);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form when closing
    setCombandaDetails(null);
    setAwb('');
    setNumeTransportator('');
  };

  if (!isOpen || !comanda) return null;

  const detailsToShow = comandaDetails || comanda;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editare Comandă #{detailsToShow.numar_comanda}</DialogTitle>
        </DialogHeader>
        
        {loadingDetails ? (
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
                  <label className="text-sm font-medium text-gray-500">Orașului Livrare</label>
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

            {/* Câmpuri editabile pentru transport */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informații Transport (Editabile)</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="awb" className="text-sm font-medium text-gray-700 block mb-2">
                    AWB
                  </label>
                  <Input
                    id="awb"
                    value={awb}
                    onChange={(e) => setAwb(e.target.value)}
                    placeholder="Numărul AWB"
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="nume_transportator" className="text-sm font-medium text-gray-700 block mb-2">
                    Nume Transportator
                  </label>
                  <Input
                    id="nume_transportator"
                    value={numeTransportator}
                    onChange={(e) => setNumeTransportator(e.target.value)}
                    placeholder="Numele companiei de transport"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

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

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Anulează
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading || loadingDetails}
          >
            {loading ? 'Se salvează...' : 'Salvează Modificările'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
