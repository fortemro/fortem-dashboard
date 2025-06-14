
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, AlertTriangle } from "lucide-react";

interface StatsData {
  vanzariTotale: string;
  vanzariChange: string;
  comenziActive: number;
  comenziChange: string;
  distributoriActivi: number;
  distributoriChange: string;
  alerteStoc: number;
  alerteChange: string;
}

interface StatsCardsProps {
  data: StatsData;
}

export function StatsCards({ data }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vânzări Totale</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.vanzariTotale}</div>
          <p className="text-xs text-muted-foreground">{data.vanzariChange} față de perioada anterioară</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comenzi Active</CardTitle>
          <Package className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.comenziActive}</div>
          <p className="text-xs text-muted-foreground">{data.comenziChange}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distribuitori Activi</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.distributoriActivi}</div>
          <p className="text-xs text-muted-foreground">{data.distributoriChange}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerte Stoc</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{data.alerteStoc}</div>
          <p className="text-xs text-muted-foreground">{data.alerteChange}</p>
        </CardContent>
      </Card>
    </div>
  );
}
