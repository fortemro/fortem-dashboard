
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useComenziLogistica } from '@/hooks/logistica/useComenziLogistica';

export function ComenziLogisticaTable() {
  const { comenzi, loading, updateComandaStatus } = useComenziLogistica();

  const statusOptions = [
    { value: 'in_procesare', label: 'în procesare' },
    { value: 'pregatit_pentru_livrare', label: 'pregătit pentru livrare' },
    { value: 'in_tranzit', label: 'în tranzit' },
    { value: 'livrata', label: 'livrată' },
    { value: 'anulata', label: 'anulată' }
  ];

  const handleStatusUpdate = async (comandaId: string, newStatus: string) => {
    await updateComandaStatus(comandaId, newStatus);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Comenzi în Așteptare</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comenzi în Așteptare</CardTitle>
        <p className="text-sm text-muted-foreground">
          Comenzile care necesită procesare logistică ({comenzi.length} comenzi)
        </p>
      </CardHeader>
      <CardContent>
        {comenzi.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nu există comenzi în așteptare în acest moment
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Număr Comandă</TableHead>
                  <TableHead>Dată Plasare</TableHead>
                  <TableHead>Distribuitor</TableHead>
                  <TableHead>Oraș Livrare</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]">Acțiuni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comenzi.map((comanda) => (
                  <TableRow key={comanda.id}>
                    <TableCell className="font-medium">
                      {comanda.numar_comanda}
                    </TableCell>
                    <TableCell>
                      {format(new Date(comanda.data_comanda), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      {comanda.distribuitor?.nume_companie || comanda.distribuitor_id}
                    </TableCell>
                    <TableCell>
                      {comanda.oras_livrare}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {comanda.status || 'in_asteptare'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Deschide meniul</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-white">
                          {statusOptions.map((option) => (
                            <DropdownMenuItem
                              key={option.value}
                              onClick={() => handleStatusUpdate(comanda.id, option.value)}
                              className="cursor-pointer"
                            >
                              {option.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
