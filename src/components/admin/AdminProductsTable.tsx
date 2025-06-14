
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AdminStats } from '@/types/adminStats';

interface AdminProductsTableProps {
  stats: AdminStats | null;
  formatCurrency: (amount: number) => string;
}

export function AdminProductsTable({ stats, formatCurrency }: AdminProductsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Produse</CardTitle>
        <CardDescription>
          Cele mai vândute produse la nivel național
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produs</TableHead>
                <TableHead>Cantitate Totală</TableHead>
                <TableHead>Valoare Totală</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.productStats.slice(0, 20).map((product) => (
                <TableRow key={product.produs_id}>
                  <TableCell className="font-medium">{product.produs_name}</TableCell>
                  <TableCell>{product.total_quantity}</TableCell>
                  <TableCell>{formatCurrency(product.total_value)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
