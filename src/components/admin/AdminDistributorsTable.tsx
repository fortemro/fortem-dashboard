import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminStats } from '@/types/adminStats';

interface AdminDistributorsTableProps {
  stats: AdminStats | null;
  formatCurrency: (amount: number) => string;
}

export function AdminDistributorsTable({ stats, formatCurrency }: AdminDistributorsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Statistici Distribuitori</CardTitle>
        <CardDescription>
          Performanța pe distribuitori
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Distribuitor</TableHead>
                <TableHead>Număr Comenzi</TableHead>
                <TableHead>Valoare Totală</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.distributorStats.map((dist) => (
                <TableRow key={dist.distribuitor_id}>
                  <TableCell className="font-medium">{dist.distribuitor_name}</TableCell>
                  <TableCell>{dist.orders_count}</TableCell>
                  <TableCell>{formatCurrency(dist.total_value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
