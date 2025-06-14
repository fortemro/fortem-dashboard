
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
import { useDashboardData } from "@/hooks/dashboard-executiv/useDashboardData";

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
  const { getDataForPeriod } = useDashboardData();

  const currentData = getDataForPeriod(selectedPeriod, customDateRange);

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

      <StatsCards data={currentData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <PerformanceCharts periodDisplay={getDisplayPeriod()} />
        <TopProducts products={currentData.topProduse} />
      </div>

      <AlertsSection alerteStoc={currentData.alerteStoc} />
    </div>
  );
}
