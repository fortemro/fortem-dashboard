
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Users, Package, Clock, Truck } from 'lucide-react';
import { AdminStats } from '@/types/adminStats';
import { Comanda } from '@/data-types';

interface AdminStatsCardsProps {
  stats: AdminStats | null;
  filteredComenzi: Comanda[];
  formatCurrency: (amount: number) => string;
}

export function AdminStatsCards({ stats, filteredComenzi, formatCurrency }: AdminStatsCardsProps) {
  const comenziInProcesare = filteredComenzi.filter(comanda => 
    comanda.status === 'in_procesare'
  ).length;

  const comenziInTranzit = filteredComenzi.filter(comanda => 
    comanda.status === 'in_tranzit'
  ).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Comenzi</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          <p className="text-xs text-muted-foreground">
            Filtrate: {filteredComenzi.length}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valoare Totală</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(stats?.totalValue || 0)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">În Procesare</CardTitle>
          <Clock className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{comenziInProcesare}</div>
          <p className="text-xs text-muted-foreground">
            Comenzi în procesare
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">În Tranzit</CardTitle>
          <Truck className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">{comenziInTranzit}</div>
          <p className="text-xs text-muted-foreground">
            Comenzi în tranzit
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MZV Activi</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.mzvPerformance.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Produse Vândute</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.productStats.length || 0}</div>
        </CardContent>
      </Card>
    </div>
  );
}
