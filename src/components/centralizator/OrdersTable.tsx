
import { useState } from 'react';
import { Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ComandaDetaliata } from '@/types/centralizator';
import OrderDetailsDialog from './OrderDetailsDialog';

interface OrdersTableProps {
  comenzi: ComandaDetaliata[];
}

export default function OrdersTable({ comenzi }: OrdersTableProps) {
  const [selectedComanda, setSelectedComanda] = useState<ComandaDetaliata | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const handleViewDetails = (comanda: ComandaDetaliata) => {
    setSelectedComanda(comanda);
    setDialogOpen(true);
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader className="pb-3 sm:pb-6">
          <CardTitle className="text-lg sm:text-xl">Comenzi ({comenzi.length})</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Total valoare comenzi afișate: {formatCurrency(comenzi.reduce((sum, c) => sum + c.total_comanda, 0))}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:px-6">
          <div className="overflow-x-auto -mx-2 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Nr. Comandă</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Data</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden sm:table-cell">Distribuitor</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Oraș</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Status</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">Produse</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Valoare</TableHead>
                      <TableHead className="text-xs sm:text-sm whitespace-nowrap">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {comenzi.map((comanda) => (
                      <TableRow key={comanda.id}>
                        <TableCell className="font-medium text-xs sm:text-sm">{comanda.numar_comanda}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{formatDate(comanda.data_comanda)}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden sm:table-cell">
                          <div className="max-w-[150px] truncate" title={comanda.distribuitor?.nume_companie || 'N/A'}>
                            {comanda.distribuitor?.nume_companie || 'N/A'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm">
                          <div className="max-w-[100px] truncate" title={comanda.oras_livrare}>
                            {comanda.oras_livrare}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(comanda.status)}</TableCell>
                        <TableCell className="text-xs sm:text-sm hidden md:table-cell">{comanda.items.length}</TableCell>
                        <TableCell className="font-semibold text-xs sm:text-sm">{formatCurrency(comanda.total_comanda)}</TableCell>
                        <TableCell>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(comanda)}
                            className="text-xs px-2 py-1"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Vezi</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          
          {comenzi.length === 0 && (
            <div className="text-center py-6 sm:py-8">
              <p className="text-gray-500 text-sm sm:text-base">Nu au fost găsite comenzi care să respecte criteriile de filtrare.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <OrderDetailsDialog 
        isOpen={dialogOpen}
        onOpenChange={setDialogOpen}
        comanda={selectedComanda}
      />
    </>
  );
}
