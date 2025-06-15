
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StockAlert {
  id: string;
  nume: string;
  stoc_disponibil: number;
  prag_alerta_stoc: number;
  categorie: string;
  severity: 'critical' | 'warning' | 'low';
}

export function useStockAlerts() {
  const { data: alerts = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-alerts'],
    queryFn: async () => {
      console.log('⚠️ Fetching stock alerts...');
      
      const { data, error } = await supabase
        .from('produse')
        .select('id, nume, stoc_disponibil, prag_alerta_stoc, categorie')
        .eq('activ', true)
        .order('stoc_disponibil', { ascending: true });

      if (error) throw new Error(error.message);

      const alerts: StockAlert[] = data
        .filter(produs => produs.stoc_disponibil <= produs.prag_alerta_stoc)
        .map(produs => ({
          ...produs,
          severity: produs.stoc_disponibil === 0 
            ? 'critical' 
            : produs.stoc_disponibil <= produs.prag_alerta_stoc * 0.5 
            ? 'warning' 
            : 'low'
        }));

      console.log(`🚨 Found ${alerts.length} stock alerts`);
      return alerts;
    },
    staleTime: 60000, // 1 minut cache pentru alerte
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh la 5 minute
  });

  const criticalAlerts = alerts.filter(a => a.severity === 'critical').length;
  const warningAlerts = alerts.filter(a => a.severity === 'warning').length;
  const lowStockAlerts = alerts.filter(a => a.severity === 'low').length;

  return {
    alerts,
    criticalAlerts,
    warningAlerts,
    lowStockAlerts,
    totalAlerts: alerts.length,
    isLoading,
    refetch
  };
}
