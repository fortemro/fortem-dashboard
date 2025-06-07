
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Copy, Edit, Mail, Download } from 'lucide-react';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  comanda: any;
}

export function OrderDetailsModal({ isOpen, onClose, comanda }: OrderDetailsModalProps) {
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
  };

  // Mock items data - in real implementation, this would come from the API
  const mockItems = [
    {
      id: '1',
      nume_produs: 'BCA FORTEM 200',
      cantitate: 5,
      pret_unitar: 450.00,
      total_item: 2250.00
    },
    {
      id: '2',
      nume_produs: 'BCA FORTEM 300',
      cantitate: 3,
      pret_unitar: 520.00,
      total_item: 1560.00
    }
  ];

  const totalComanda = mockItems.reduce((sum, item) => sum + item.total_item, 0);

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
                  
                  <span className="font-medium">Paleti Total:</span>
                  <span>{comanda.numar_paleti}</span>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produs</TableHead>
                    <TableHead className="text-right">Cantitate (Paleti)</TableHead>
                    <TableHead className="text-right">Preț/Palet</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nume_produs}</TableCell>
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
                <Button variant="outline">
                  <Edit className="h-4 w-4 mr-2" />
                  Editează
                </Button>
              )}
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Duplică
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Retrimite Email
              </Button>
              <Button variant="outline">
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
