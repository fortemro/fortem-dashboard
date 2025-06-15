
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, Users, AlertTriangle, ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface ExecutiveKPIs {
  vanzariTotale: number;
  vanzariTotalePrecedent: number;
  comenziActive: number;
  comenziActivePrecedent: number;
  distributoriActivi: number;
  distributoriActiviPrecedent: number;
  alerteStoc: number;
  produseStocZero: number;
  totalPaleti: number;
  totalProfit: number;
}

interface StatsCardsProps {
  kpis: ExecutiveKPIs;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const calculatePercentageChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
};

const formatPercentage = (percentage: number) => {
  const abs = Math.abs(percentage);
  const sign = percentage >= 0 ? '+' : '-';
  return `${sign}${abs.toFixed(1)}%`;
};

export function StatsCards({ kpis, isLoading }: StatsCardsProps) {
  const vanzariChange = calculatePercentageChange(kpis.vanzariTotale, kpis.vanzariTotalePrecedent);
  const comenziChange = calculatePercentageChange(kpis.comenziActive, kpis.comenziActivePrecedent);
  const distributoriChange = calculatePercentageChange(kpis.distributoriActivi, kpis.distributoriActiviPrecedent);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-40"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Vânzări Totale</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-green-700">
            {formatCurrency(kpis.vanzariTotale)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {vanzariChange >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={vanzariChange >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(vanzariChange)}
            </span>
            <span className="ml-1">față de perioada anterioară</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comenzi Active</CardTitle>
          <Package className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-blue-700">
            {kpis.comenziActive.toLocaleString('ro-RO')}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {comenziChange >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={comenziChange >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(comenziChange)}
            </span>
            <span className="ml-1">comenzi ({kpis.totalPaleti} paleți)</span>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-purple-500">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Distribuitori Activi</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-xl sm:text-2xl font-bold text-purple-700">
            {kpis.distributoriActivi}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {distributoriChange >= 0 ? (
              <ArrowUpIcon className="h-3 w-3 text-green-600 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 text-red-600 mr-1" />
            )}
            <span className={distributoriChange >= 0 ? "text-green-600" : "text-red-600"}>
              {formatPercentage(distributoriChange)}
            </span>
            <span className="ml-1">față de perioada anterioară</span>
          </div>
        </CardContent>
      </Card>

      <Card className={`hover:shadow-md transition-shadow border-l-4 ${kpis.alerteStoc > 0 ? 'border-l-red-500 bg-red-50' : 'border-l-green-500 bg-green-50'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Alerte Stoc</CardTitle>
          <AlertTriangle className={`h-4 w-4 ${kpis.alerteStoc > 0 ? 'text-red-600' : 'text-green-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-xl sm:text-2xl font-bold ${kpis.alerteStoc > 0 ? 'text-red-700' : 'text-green-700'}`}>
            {kpis.alerteStoc}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {kpis.produseStocZero > 0 && (
              <span className="text-red-600 font-medium">
                {kpis.produseStocZero} produse cu stoc ZERO
              </span>
            )}
            {kpis.produseStocZero === 0 && kpis.alerteStoc === 0 && (
              <span className="text-green-600">Toate stocurile sunt OK</span>
            )}
            {kpis.produseStocZero === 0 && kpis.alerteStoc > 0 && (
              <span className="text-orange-600">produse sub pragul de alertă</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
