
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PeriodFilterComponent, PeriodFilter } from "@/components/dashboard-executiv/PeriodFilter";
import { StatsCards } from "@/components/dashboard-executiv/StatsCards";
import { PerformanceCharts } from "@/components/dashboard-executiv/PerformanceCharts";
import { TopProducts } from "@/components/dashboard-executiv/TopProducts";
import { AlertsSection } from "@/components/dashboard-executiv/AlertsSection";
import { ComenziAnulateTable } from "@/components/shared/ComenziAnulateTable";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { useDashboardData } from "@/hooks/dashboard-executiv/useDashboardData";
import { useComenziAnulateGlobal } from "@/hooks/useComenziAnulateGlobal";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, XCircle, TrendingUp } from "lucide-react";

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Astăzi' },
  { value: 'yesterday', label: 'Ieri' },
  { value: 'last7days', label: 'Ultimele 7 Zile' },
  { value: 'thisMonth', label: 'Luna Aceasta' },
  { value: 'custom', label: 'Interval Personalizat' },
];

export default function DashboardExecutiv() {
  const { profile, loading } = useProfile();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');
  const [customDateRange, setCustomDateRange] = useState<DateRange | undefined>();
  const { comenzi, isLoading } = useExecutiveData();
  const { getDataForPeriod } = useDashboardData();
  const { comenziAnulate, loading: loadingAnulate } = useComenziAnulateGlobal();

  const handlePeriodChange = (period: PeriodFilter) => {
    setSelectedPeriod(period);
    if (period !== 'custom') {
      setCustomDateRange(undefined);
    }
  };

  const getDisplayPeriod = () => {
    if (selectedPeriod === 'custom' && customDateRange?.from && customDateRange?.to) {
      return `${format(customDateRange.from, 'dd/MM/yyyy')} - ${format(customDateRange.to, 'dd/MM/yyyy')}`;
    }
    return periodOptions.find(p => p.value === selectedPeriod)?.label || 'Necunoscut';
  };

  // Calculăm statisticile reale pe baza comenzilor din baza de date
  const calculateRealStats = () => {
    if (!comenzi.length) {
      return {
        vanzariTotale: "0 RON",
        vanzariChange: "0%",
        comenziActive: 0,
        comenziChange: "0 comenzi în sistem",
        distributoriActivi: 0,
        distributoriChange: "0 distribuitori activi",
        alerteStoc: 0,
        alerteChange: "0 produse sub prag"
      };
    }

    const totalVanzari = comenzi.reduce((sum, comanda) => sum + (comanda.total_comanda || 0), 0);
    const comenziActuale = comenzi.length;
    
    // Calculăm distribuitorii unici
    const distributoriUnici = new Set(comenzi.map(c => c.distribuitor_id)).size;

    return {
      vanzariTotale: `${totalVanzari.toLocaleString('ro-RO')} RON`,
      vanzariChange: "+0%", // Ar trebui calculat comparativ cu perioada anterioară
      comenziActive: comenziActuale,
      comenziChange: `${comenziActuale} comenzi în sistem`,
      distributoriActivi: distributoriUnici,
      distributoriChange: `${distributoriUnici} distribuitori activi`,
      alerteStoc: 0, // Ar trebui calculat din stocuri
      alerteChange: "Date indisponibile"
    };
  };

  // Calculăm top produse pe baza comenzilor reale
  const calculateTopProducts = () => {
    if (!comenzi.length) {
      return [];
    }

    // Pentru simplitate, folosim datele din useDashboardData pentru perioada selectată
    const periodData = getDataForPeriod(selectedPeriod, customDateRange);
    return periodData.topProduse || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || profile.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  const realData = calculateRealStats();
  const topProducts = calculateTopProducts();

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 mt-16">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Executiv</h1>
        <p className="text-sm sm:text-base text-gray-600">Raport executiv și indicatori cheie de performanță</p>
      </div>

      <PeriodFilterComponent
        selectedPeriod={selectedPeriod}
        customDateRange={customDateRange}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={setCustomDateRange}
      />

      {/* Tabs pentru dashboard și comenzi anulate */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard Principal
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Comenzi Anulate ({começiAnulate.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          {isLoading ? (
            <div className="space-y-6 sm:space-y-8">
              {/* Loading skeleton pentru stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-lg border p-4 sm:p-6">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 sm:h-8 w-32 mb-2" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                ))}
              </div>

              {/* Loading skeleton pentru charts și top products */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-white rounded-lg border p-4 sm:p-6">
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-48 sm:h-64 w-full" />
                </div>
                <div className="bg-white rounded-lg border p-4 sm:p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex justify-between">
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                        <div className="text-right">
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading skeleton pentru alerts */}
              <div className="bg-orange-50 rounded-lg border border-orange-200 p-4 sm:p-6">
                <Skeleton className="h-6 w-48 mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          ) : (
            <>
              <StatsCards data={realData} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <PerformanceCharts periodDisplay={getDisplayPeriod()} />
                <TopProducts products={topProducts} />
              </div>

              <AlertsSection alerteStoc={realData.alerteStoc} />
            </>
          )}
        </TabsContent>
        
        <TabsContent value="cancelled">
          <ComenziAnulateTable
            comenziAnulate={começiAnulate}
            loading={loadingAnulate}
            showUserColumn={true}
            title="Comenzi Anulate - Dashboard Executiv"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
