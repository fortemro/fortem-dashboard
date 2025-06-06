
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
      'finalizata': 'bg-green-100 text-green-800',
      'anulata': 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || 'bg-gray-100 text-gray-800'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (!comanda) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalii Comandă {comanda.numar_comanda}</DialogTitle>
          <DialogDescription>
            Toate informațiile despre această comandă
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">Informații Generale</TabsTrigger>
            <TabsTrigger value="livrare">Livrare</TabsTrigger>
            <TabsTrigger value="produse">Produse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Număr Comandă</label>
                <p className="text-sm text-gray-600">{comanda.numar_comanda}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Data Comandă</label>
                <p className="text-sm text-gray-600">{formatDate(comanda.data_comanda)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <div className="mt-1">{getStatusBadge(comanda.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium">Număr Paleți</label>
                <p className="text-sm text-gray-600">{comanda.numar_paleti}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Distribuitor</label>
                <p className="text-sm text-gray-600">{comanda.distribuitor?.nume_companie}</p>
              </div>
              {comanda.observatii && (
                <div className="col-span-2">
                  <label className="text-sm font-medium">Observații</label>
                  <p className="text-sm text-gray-600">{comanda.observatii}</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="livrare" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Oraș</label>
                <p className="text-sm text-gray-600">{comanda.oras_livrare}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Județ</label>
                <p className="text-sm text-gray-600">{comanda.judet_livrare || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <label className="text-sm font-medium">Adresă</label>
                <p className="text-sm text-gray-600">{comanda.adresa_livrare}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Telefon</label>
                <p className="text-sm text-gray-600">{comanda.telefon_livrare || 'N/A'}</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="produse" className="space-y-4">
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
                {comanda.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.produs?.nume || 'N/A'}</TableCell>
                    <TableCell>{item.produs?.dimensiuni || 'N/A'}</TableCell>
                    <TableCell>{item.cantitate}</TableCell>
                    <TableCell>{formatCurrency(item.pret_unitar)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(item.total_item)}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-gray-50">
                  <TableCell colSpan={4} className="font-semibold">TOTAL COMANDĂ</TableCell>
                  <TableCell className="font-bold text-lg">{formatCurrency(comanda.total_comanda)}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
