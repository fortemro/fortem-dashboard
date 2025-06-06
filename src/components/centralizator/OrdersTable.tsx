
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
      <Card>
        <CardHeader>
          <CardTitle>Comenzi ({comenzi.length})</CardTitle>
          <CardDescription>
            Total valoare comenzi afișate: {formatCurrency(comenzi.reduce((sum, c) => sum + c.total_comanda, 0))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nr. Comandă</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Distribuitor</TableHead>
                  <TableHead>Oraș Livrare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Produse</TableHead>
                  <TableHead>Valoare</TableHead>
                  <TableHead>Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comenzi.map((comanda) => (
                  <TableRow key={comanda.id}>
                    <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                    <TableCell>{formatDate(comanda.data_comanda)}</TableCell>
                    <TableCell>{comanda.distribuitor?.nume_companie || 'N/A'}</TableCell>
                    <TableCell>{comanda.oras_livrare}</TableCell>
                    <TableCell>{getStatusBadge(comanda.status)}</TableCell>
                    <TableCell>{comanda.items.length} produse</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(comanda.total_comanda)}</TableCell>
                    <TableCell>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(comanda)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Vezi Detalii
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {comenzi.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">Nu au fost găsite comenzi care să respecte criteriile de filtrare.</p>
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
