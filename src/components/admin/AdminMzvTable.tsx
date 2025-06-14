
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminStats } from '@/types/adminStats';

interface AdminMzvTableProps {
  stats: AdminStats | null;
  formatCurrency: (amount: number) => string;
}

export function AdminMzvTable({ stats, formatCurrency }: AdminMzvTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performanța MZV</CardTitle>
        <CardDescription>
          Statistici detaliate pentru fiecare MZV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>MZV</TableHead>
                <TableHead>Număr Comenzi</TableHead>
                <TableHead>Valoare Totală</TableHead>
                <TableHead>Medie pe Comandă</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.mzvPerformance.map((mzv) => (
                <TableRow key={mzv.mzv_id}>
                  <TableCell className="font-medium">{mzv.mzv_name}</TableCell>
                  <TableCell>{mzv.orders_count}</TableCell>
                  <TableCell>{formatCurrency(mzv.total_value)}</TableCell>
                  <TableCell>
                    {formatCurrency(mzv.total_value / mzv.orders_count)}
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
