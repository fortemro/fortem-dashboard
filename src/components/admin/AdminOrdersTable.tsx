
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Comanda } from '@/data-types';

interface AdminOrdersTableProps {
  filteredComenzi: Comanda[];
}

export function AdminOrdersTable({ filteredComenzi }: AdminOrdersTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Toate Comenzile</CardTitle>
        <CardDescription>
          Lista completă a comenzilor cu posibilități de filtrare
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Număr Comandă</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>MZV</TableHead>
                <TableHead>Distribuitor</TableHead>
                <TableHead>Transportator</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredComenzi.map((comanda) => (
                <TableRow key={comanda.id}>
                  <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                  <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                  <TableCell>MZV</TableCell>
                  <TableCell>Distribuitor</TableCell>
                  <TableCell>{comanda.nume_transportator || '-'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      comanda.status === 'Finalizata' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {comanda.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
