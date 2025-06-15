
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

interface StockAlert {
  id: string;
  nume: string;
  stoc_disponibil: number;
  prag_alerta_stoc: number;
  categorie: string;
  severity: 'critical' | 'warning' | 'low';
  percentage: number;
}

interface StockAlertsReturn {
  alerts: StockAlert[];
  criticalAlerts: number;
  warningAlerts: number;
  lowStockAlerts: number;
  totalAlerts: number;
  isLoading: boolean;
  refetch: () => void;
}

export function useStockAlerts(): StockAlertsReturn {
  const { toast } = useToast();
  const previousAlertsRef = useRef<StockAlert[]>([]);

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
        .map(produs => {
          const percentage = produs.prag_alerta_stoc > 0 
            ? (produs.stoc_disponibil / produs.prag_alerta_stoc) * 100 
            : 0;
          
          let severity: 'critical' | 'warning' | 'low';
          
          if (produs.stoc_disponibil === 0) {
            severity = 'critical';
          } else if (percentage <= 25) {
            severity = 'warning';
          } else {
            severity = 'low';
          }

          return {
            ...produs,
            severity,
            percentage: Math.round(percentage)
          };
        })
        .sort((a, b) => {
          // Sortare: critical -> warning -> low, apoi după stoc disponibil
          const severityOrder = { critical: 0, warning: 1, low: 2 };
          if (severityOrder[a.severity] !== severityOrder[b.severity]) {
            return severityOrder[a.severity] - severityOrder[b.severity];
          }
          return a.stoc_disponibil - b.stoc_disponibil;
        });

      console.log(`🚨 Found ${alerts.length} stock alerts`);
      return alerts;
    },
    staleTime: 60000, // 1 minut cache pentru alerte
    gcTime: 5 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000, // Refresh la 5 minute
  });

  // Sistem de notificări pentru alerte noi sau critice
  useEffect(() => {
    if (!alerts.length || isLoading) return;

    const currentCritical = alerts.filter(a => a.severity === 'critical');
    const previousCritical = previousAlertsRef.current.filter(a => a.severity === 'critical');

    // Detectează produse noi cu stoc ZERO
    const newCriticalAlerts = currentCritical.filter(current => 
      !previousCritical.some(prev => prev.id === current.id)
    );

    // Detectează produse care au ajuns la stoc ZERO
    const newlyZeroStock = alerts.filter(current => 
      current.stoc_disponibil === 0 && 
      previousAlertsRef.current.some(prev => 
        prev.id === current.id && prev.stoc_disponibil > 0
      )
    );

    // Notificări pentru alerte critice noi
    if (newCriticalAlerts.length > 0) {
      newCriticalAlerts.forEach(alert => {
        toast({
          title: "🚨 ALERTĂ STOC CRITIC",
          description: `${alert.nume} - Stoc EPUIZAT!`,
          variant: "destructive",
        });
      });
    }

    // Notificări pentru produse care au ajuns la stoc zero
    if (newlyZeroStock.length > 0) {
      newlyZeroStock.forEach(alert => {
        toast({
          title: "⚠️ STOC EPUIZAT",
          description: `${alert.nume} - Stocul s-a epuizat complet!`,
          variant: "destructive",
        });
      });
    }

    // Notificare generală pentru alertele critice la prima încărcare
    if (previousAlertsRef.current.length === 0 && currentCritical.length > 0) {
      toast({
        title: "🚨 Alerte Stoc Detectate",
        description: `${currentCritical.length} produse au stocul epuizat`,
        variant: "destructive",
      });
    }

    previousAlertsRef.current = alerts;
  }, [alerts, isLoading, toast]);

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
