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
import { NotificationBell } from "@/components/dashboard-executiv/NotificationBell";
import { AdvancedCharts } from "@/components/dashboard-executiv/AdvancedCharts";
import { ExecutiveReporting } from "@/components/dashboard-executiv/ExecutiveReporting";
import { ComenziAnulateTable } from "@/components/shared/ComenziAnulateTable";
import { useComenziAnulateGlobal } from "@/hooks/useComenziAnulateGlobal";
import { useExecutiveDashboardData } from "@/hooks/dashboard-executiv/useExecutiveDashboardData";
import { TrendingUp, XCircle, AlertTriangle, RefreshCw, BarChart3, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring";

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
  const { comenziAnulate, loading: loadingAnulate } = useComenziAnulateGlobal();
  const { kpis, topProducts, isLoading, error } = useExecutiveDashboardData(selectedPeriod, customDateRange);
  const { trackComponentRender } = usePerformanceMonitoring();
  const { toast } = useToast();

  // Track component performance
  useEffect(() => {
    const stopTracking = trackComponentRender('DashboardExecutiv');
    return stopTracking;
  }, [trackComponentRender]);

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

  const handleRefresh = () => {
    window.location.reload();
    toast({
      title: "Date actualizate",
      description: "Dashboard-ul a fost actualizat cu cele mai recente date.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă dashboard-ul executiv...</p>
        </div>
      </div>
    );
  }

  if (!profile || profile.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Eroare la încărcarea datelor</h2>
          <p className="text-gray-600 mb-4">{error.message}</p>
          <Button onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Încearcă din nou
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8 mt-16">
      <div className="mb-6 sm:mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Dashboard Executiv</h1>
            <p className="text-sm sm:text-base text-gray-600">Raport executiv și indicatori cheie de performanță</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizează
            </Button>
          </div>
        </div>
      </div>

      <PeriodFilterComponent
        selectedPeriod={selectedPeriod}
        customDateRange={customDateRange}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={setCustomDateRange}
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Rapoarte
          </TabsTrigger>
          <TabsTrigger value="cancelled" className="flex items-center gap-2">
            <XCircle className="h-4 w-4" />
            Anulate ({comenziAnulate.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard">
          <StatsCards kpis={kpis} isLoading={isLoading} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <PerformanceCharts periodDisplay={getDisplayPeriod()} />
            <TopProducts products={topProducts} isLoading={isLoading} />
          </div>

          <AlertsSection />
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Analytics Avansate</h2>
            </div>
            <p className="text-gray-600">Grafice interactive și insights detaliate pentru perioada selectată</p>
          </div>
          
          <AdvancedCharts />
        </TabsContent>
        
        <TabsContent value="performance">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold">Performance Monitoring & Mobile</h2>
            </div>
            <p className="text-gray-600">Monitorizare performanță și optimizări mobile pentru experiența optimă</p>
          </div>
          
          <div className="space-y-6">
            <PerformanceInsights />
            <MobileOptimizations />
          </div>
        </TabsContent>
        
        <TabsContent value="reports">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Sistem de Raportare Executive</h2>
            </div>
            <p className="text-gray-600">Generare și programare rapoarte executive pentru management</p>
          </div>
          
          <ExecutiveReporting />
        </TabsContent>
        
        <TabsContent value="cancelled">
          <ComenziAnulateTable
            comenziAnulate={comenziAnulate}
            loading={loadingAnulate}
            showUserColumn={true}
            title="Comenzi Anulate - Dashboard Executiv"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
