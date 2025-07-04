
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMemo } from 'react';
import { PeriodFilter } from '@/components/dashboard-executiv/PeriodFilter';
import { DateRange } from 'react-day-picker';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

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

interface TopProduct {
  nume: string;
  cantitate: number;
  valoare: number;
  trend: number;
  paleti: number;
}

interface PerformanceDataPoint {
  date: string;
  vanzari: number;
  comenzi: number;
  dateLabel: string;
}

interface ExecutiveDashboardData {
  kpis: ExecutiveKPIs;
  topProducts: TopProduct[];
  performanceData: PerformanceDataPoint[];
  isLoading: boolean;
  error: Error | null;
}

const getDateRangeForPeriod = (period: PeriodFilter, customRange?: DateRange) => {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        start: startOfDay(now),
        end: endOfDay(now),
        previousStart: startOfDay(subDays(now, 1)),
        previousEnd: endOfDay(subDays(now, 1))
      };
    case 'yesterday':
      return {
        start: startOfDay(subDays(now, 1)),
        end: endOfDay(subDays(now, 1)),
        previousStart: startOfDay(subDays(now, 2)),
        previousEnd: endOfDay(subDays(now, 2))
      };
    case 'last7days':
      return {
        start: startOfDay(subDays(now, 6)),
        end: endOfDay(now),
        previousStart: startOfDay(subDays(now, 13)),
        previousEnd: endOfDay(subDays(now, 7))
      };
    case 'thisMonth':
      return {
        start: startOfMonth(now),
        end: endOfMonth(now),
        previousStart: startOfMonth(subMonths(now, 1)),
        previousEnd: endOfMonth(subMonths(now, 1))
      };
    case 'custom':
      if (!customRange?.from || !customRange?.to) return getDateRangeForPeriod('today');
      const daysDiff = Math.ceil((customRange.to.getTime() - customRange.from.getTime()) / (1000 * 60 * 60 * 24));
      return {
        start: startOfDay(customRange.from),
        end: endOfDay(customRange.to),
        previousStart: startOfDay(subDays(customRange.from, daysDiff + 1)),
        previousEnd: endOfDay(subDays(customRange.from, 1))
      };
    default:
      return getDateRangeForPeriod('today');
  }
};

const generatePerformanceData = async (dateRange: any): Promise<PerformanceDataPoint[]> => {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const performanceData: PerformanceDataPoint[] = [];

  // Generate data points for each day in the range
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);

    const { data: comenziZi, error } = await supabase
      .from('comenzi')
      .select('total_comanda, id')
      .gte('data_comanda', dayStart.toISOString())
      .lte('data_comanda', dayEnd.toISOString())
      .neq('status', 'anulata');

    if (error) throw new Error(error.message);

    const vanzariZi = comenziZi?.reduce((sum, c) => sum + (c.total_comanda || 0), 0) || 0;
    const comenziZi_count = comenziZi?.length || 0;

    performanceData.push({
      date: currentDate.toISOString(),
      vanzari: Math.round(vanzariZi),
      comenzi: comenziZi_count,
      dateLabel: format(currentDate, 'dd/MM')
    });
  }

  return performanceData;
};

export function useExecutiveDashboardData(
  period: PeriodFilter = 'today',
  customDateRange?: DateRange
): ExecutiveDashboardData {
  const dateRange = useMemo(() => getDateRangeForPeriod(period, customDateRange), [period, customDateRange]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['executive-dashboard', period, dateRange.start, dateRange.end],
    queryFn: async () => {
      console.log('🎯 Fetching executive dashboard data for period:', period);
      
      // 1. Fetch comenzile pentru perioada curentă
      const { data: comenziCurente, error: comenziError } = await supabase
        .from('comenzi')
        .select(`
          id,
          total_comanda,
          numar_paleti,
          distribuitor_id,
          data_comanda,
          status
        `)
        .gte('data_comanda', dateRange.start.toISOString())
        .lte('data_comanda', dateRange.end.toISOString())
        .neq('status', 'anulata');

      if (comenziError) throw new Error(comenziError.message);

      // 2. Fetch comenzile pentru perioada precedentă
      const { data: comenziPrecedente, error: precedenteError } = await supabase
        .from('comenzi')
        .select(`
          id,
          total_comanda,
          distribuitor_id
        `)
        .gte('data_comanda', dateRange.previousStart.toISOString())
        .lte('data_comanda', dateRange.previousEnd.toISOString())
        .neq('status', 'anulata');

      if (precedenteError) throw new Error(precedenteError.message);

      // 3. Fetch itemi_comanda pentru perioada curentă
      const { data: itemsCurente, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select(`
          cantitate,
          total_item,
          produs_id,
          comanda_id
        `)
        .in('comanda_id', (comenziCurente || []).map(c => c.id));

      if (itemsError) throw new Error(itemsError.message);

      // 4. Fetch produse separately to avoid relationship issues
      const produseIds = [...new Set(itemsCurente?.map(item => item.produs_id) || [])];
      const { data: produseData, error: produseError } = await supabase
        .from('produse')
        .select('id, nume, categorie')
        .in('id', produseIds);

      if (produseError) throw new Error(produseError.message);

      // 5. Fetch datele despre stocuri pentru alerte
      const { data: stocuriData, error: stocuriError } = await supabase
        .from('produse')
        .select('id, nume, stoc_disponibil, prag_alerta_stoc')
        .eq('activ', true);

      if (stocuriError) throw new Error(stocuriError.message);

      // 6. Generate performance data
      const performanceData = await generatePerformanceData(dateRange);

      // 7. Calculează KPI-urile
      const vanzariTotale = comenziCurente?.reduce((sum, c) => sum + (c.total_comanda || 0), 0) || 0;
      const vanzariTotalePrecedent = comenziPrecedente?.reduce((sum, c) => sum + (c.total_comanda || 0), 0) || 0;
      
      const comenziActive = comenziCurente?.length || 0;
      const comenziActivePrecedent = comenziPrecedente?.length || 0;
      
      const distributoriActivi = new Set(comenziCurente?.map(c => c.distribuitor_id)).size;
      const distributoriActiviPrecedent = new Set(comenziPrecedente?.map(c => c.distribuitor_id)).size;
      
      const totalPaleti = comenziCurente?.reduce((sum, c) => sum + (c.numar_paleti || 0), 0) || 0;
      
      // Calcule pentru stocuri
      const alerteStoc = stocuriData?.filter(p => p.stoc_disponibil <= p.prag_alerta_stoc).length || 0;
      const produseStocZero = stocuriData?.filter(p => p.stoc_disponibil === 0).length || 0;

      // 8. Create a map of products for easy lookup
      const produseMap = new Map(produseData?.map(p => [p.id, p]) || []);

      // 9. Calculează top produse din perioada curentă
      const topProduseMap = new Map<string, TopProduct>();
      
      itemsCurente?.forEach(item => {
        const produs = produseMap.get(item.produs_id);
        const produsNume = produs?.nume || 'Produs necunoscut';
        const key = item.produs_id;
        const existing = topProduseMap.get(key);
        
        if (existing) {
          existing.cantitate += item.cantitate;
          existing.valoare += item.total_item || 0;
        } else {
          topProduseMap.set(key, {
            nume: produsNume,
            cantitate: item.cantitate,
            valoare: item.total_item || 0,
            trend: 0, // Va fi calculat mai jos
            paleti: Math.ceil(item.cantitate / 100) // Estimare
          });
        }
      });

      const topProducts = Array.from(topProduseMap.values())
        .sort((a, b) => b.valoare - a.valoare)
        .slice(0, 5)
        .map(product => ({
          ...product,
          trend: Math.random() * 40 - 20 // Placeholder pentru trend - va fi calculat real mai târziu
        }));

      const kpis: ExecutiveKPIs = {
        vanzariTotale,
        vanzariTotalePrecedent,
        comenziActive,
        comenziActivePrecedent,
        distributoriActivi,
        distributoriActiviPrecedent,
        alerteStoc,
        produseStocZero,
        totalPaleti,
        totalProfit: vanzariTotale * 0.15 // Estimare 15% profit margin
      };

      console.log('📊 Executive KPIs calculated:', kpis);
      console.log('🏆 Top products:', topProducts);
      console.log('📈 Performance data:', performanceData);

      return { kpis, topProducts, performanceData };
    },
    staleTime: 30000, // 30 secunde cache
    gcTime: 5 * 60 * 1000, // 5 minute în memorie
    refetchOnWindowFocus: false,
  });

  return {
    kpis: data?.kpis || {
      vanzariTotale: 0,
      vanzariTotalePrecedent: 0,
      comenziActive: 0,
      comenziActivePrecedent: 0,
      distributoriActivi: 0,
      distributoriActiviPrecedent: 0,
      alerteStoc: 0,
      produseStocZero: 0,
      totalPaleti: 0,
      totalProfit: 0
    },
    topProducts: data?.topProducts || [],
    performanceData: data?.performanceData || [],
    isLoading,
    error: error as Error | null
  };
}
