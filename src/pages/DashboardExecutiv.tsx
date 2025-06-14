
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { useState } from "react";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { PeriodFilterComponent, PeriodFilter } from "@/components/dashboard-executiv/PeriodFilter";
import { StatsCards } from "@/components/dashboard-executiv/StatsCards";
import { PerformanceCharts } from "@/components/dashboard-executiv/PerformanceCharts";
import { TopProducts } from "@/components/dashboard-executiv/TopProducts";
import { AlertsSection } from "@/components/dashboard-executiv/AlertsSection";
import { useExecutiveData } from "@/hooks/useExecutiveData";
import { Skeleton } from "@/components/ui/skeleton";

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

  // Mock data pentru demonstrare - în viitor va fi calculat din comenzi
  const mockData = {
    vanzariTotale: "2.580.000 RON",
    vanzariChange: "+12.5%",
    comenziActive: comenzi.length,
    comenziChange: `${comenzi.length} comenzi în sistem`,
    distributoriActivi: 15,
    distributoriChange: "+2 față de luna trecută",
    alerteStoc: 8,
    alerteChange: "3 produse noi sub prag"
  };

  const mockTopProducts = [
    { nume: "BCA FORTEM 100", cantitate: "1,250 buc", valoare: "185.000 RON", trend: "+15%" },
    { nume: "BCA FORTEM 200", cantitate: "980 buc", valoare: "147.000 RON", trend: "+8%" },
    { nume: "BCA FORTEM 150", cantitate: "840 buc", valoare: "126.000 RON", trend: "+5%" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile || profile.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Executiv</h1>
        <p className="text-gray-600">Raport executiv și indicatori cheie de performanță</p>
      </div>

      <PeriodFilterComponent
        selectedPeriod={selectedPeriod}
        customDateRange={customDateRange}
        onPeriodChange={handlePeriodChange}
        onDateRangeChange={setCustomDateRange}
      />

      {isLoading ? (
        <div className="space-y-8">
          {/* Loading skeleton pentru stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg border p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>

          {/* Loading skeleton pentru charts și top products */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <Skeleton className="h-64 w-full" />
            </div>
            <div className="bg-white rounded-lg border p-6">
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
          <div className="bg-orange-50 rounded-lg border border-orange-200 p-6">
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
          <StatsCards data={mockData} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PerformanceCharts periodDisplay={getDisplayPeriod()} />
            <TopProducts products={mockTopProducts} />
          </div>

          <AlertsSection alerteStoc={mockData.alerteStoc} />
        </>
      )}
    </div>
  );
}
