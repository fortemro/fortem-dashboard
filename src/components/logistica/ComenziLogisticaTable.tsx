
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useComenziLogistica } from '@/hooks/logistica/useComenziLogistica';

export function ComenziLogisticaTable() {
  const { comenzi, loading } = useComenziLogistica();

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
                  <TableHead>Numărul Comenzii</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Distribuitor</TableHead>
                  <TableHead>Paleti</TableHead>
                  <TableHead>Data Comandă</TableHead>
                  <TableHead>Adresa Livrare</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comenzi.map((comanda) => (
                  <TableRow key={comanda.id}>
                    <TableCell className="font-medium">
                      {comanda.numar_comanda}
                    </TableCell>
                    <TableCell>
                      {comanda.user_profile?.nume_complet || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {comanda.distribuitor?.nume_companie || comanda.distribuitor_id}
                    </TableCell>
                    <TableCell>
                      {comanda.calculated_paleti || comanda.numar_paleti}
                    </TableCell>
                    <TableCell>
                      {format(new Date(comanda.data_comanda), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">
                        {comanda.adresa_livrare}, {comanda.oras_livrare}
                        {comanda.judet_livrare && `, ${comanda.judet_livrare}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {comanda.status || 'in_asteptare'}
                      </Badge>
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
