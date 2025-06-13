
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ComandaDetaliata } from '@/types/centralizator';

interface OrderDetailsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  comanda: ComandaDetaliata | null;
}

export default function OrderDetailsDialog({ isOpen, onOpenChange, comanda }: OrderDetailsDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ro-RO');
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      'in_asteptare': 'bg-yellow-100 text-yellow-800',
      'procesare': 'bg-blue-100 text-blue-800',
      'in_procesare': 'bg-blue-100 text-blue-800',
      'pregatit_pentru_livrare': 'bg-orange-100 text-orange-800',
      'in_tranzit': 'bg-purple-100 text-purple-800',
      'livrata': 'bg-green-100 text-green-800',
      'finalizata': 'bg-green-100 text-green-800',
      'anulata': 'bg-red-100 text-red-800'
    };

    const statusLabels = {
      'in_asteptare': 'ÎN AȘTEPTARE',
      'procesare': 'PROCESARE',
      'in_procesare': 'ÎN PROCESARE',
      'pregatit_pentru_livrare': 'PREGĂTIT LIVRARE',
      'in_tranzit': 'ÎN TRANZIT',
      'livrata': 'LIVRATĂ',
      'finalizata': 'FINALIZATĂ',
      'anulata': 'ANULATĂ'
    };

    const label = statusLabels[status as keyof typeof statusLabels] || status.toUpperCase();

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {label}
      </Badge>
    );
  };

  if (!comanda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] sm:max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">Detalii Comandă {comanda.numar_comanda}</DialogTitle>
          <DialogDescription className="text-sm">
            Toate informațiile despre această comandă
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm">
            <TabsTrigger value="general" className="px-2 py-1">Generale</TabsTrigger>
            <TabsTrigger value="livrare" className="px-2 py-1">Livrare</TabsTrigger>
            <TabsTrigger value="produse" className="px-2 py-1">Produse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium">Număr Comandă</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.numar_comanda}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Data Comandă</label>
                <p className="text-xs sm:text-sm text-gray-600">{formatDate(comanda.data_comanda)}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Status</label>
                <div className="mt-1">{getStatusBadge(comanda.status)}</div>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Număr Paleți</label>
                <p className="text-xs sm:text-sm text-gray-600">{comanda.numar_paleti}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium">Distribuitor</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.distribuitor?.nume_companie}</p>
              </div>
              {comanda.observatii && (
                <div className="col-span-1 sm:col-span-2">
                  <label className="text-xs sm:text-sm font-medium">Observații</label>
                  <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.observatii}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="livrare" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-medium">Oraș</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.oras_livrare}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Județ</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.judet_livrare || 'N/A'}</p>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <label className="text-xs sm:text-sm font-medium">Adresă</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.adresa_livrare}</p>
              </div>
              <div>
                <label className="text-xs sm:text-sm font-medium">Telefon</label>
                <p className="text-xs sm:text-sm text-gray-600 break-words">{comanda.telefon_livrare || 'N/A'}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="produse" className="space-y-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Produs</TableHead>
                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Dimensiuni</TableHead>
                    <TableHead className="text-xs sm:text-sm">Cant.</TableHead>
                    <TableHead className="text-xs sm:text-sm">Preț</TableHead>
                    <TableHead className="text-xs sm:text-sm">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comanda.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="max-w-[120px] sm:max-w-none break-words">
                          {item.produs?.nume || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                        <div className="max-w-[100px] break-words">
                          {item.produs?.dimensiuni || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">{item.cantitate}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{formatCurrency(item.pret_unitar)}</TableCell>
                      <TableCell className="font-semibold text-xs sm:text-sm">{formatCurrency(item.total_item)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={4} className="font-semibold text-xs sm:text-sm">TOTAL COMANDĂ</TableCell>
                    <TableCell className="font-bold text-sm sm:text-lg">{formatCurrency(comanda.total_comanda)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
