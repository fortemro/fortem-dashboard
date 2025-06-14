
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLogisticaStats() {
  const { data: stats, isLoading: loading } = useQuery({
    queryKey: ['logistica-stats'],
    queryFn: async () => {
      console.log('Calculating logistica stats...');
      
      // Get current date for calculations
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

      // Query all relevant data
      const { data: allComenzi, error } = await supabase
        .from('comenzi')
        .select('id, status, data_expediere, awb, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comenzi for stats:', error);
        throw error;
      }

      console.log('Total comenzi found:', allComenzi?.length || 0);

      if (!allComenzi) {
        return {
          comenziInProcesare: 0,
          livrariprogramate: 0,
          ruteActive: 0,
          eficientaLivrari: 0
        };
      }

      // Calculate comenzi în procesare (in_procesare + pregatit_pentru_livrare)
      const comenziInProcesare = allComenzi.filter(comanda => 
        comanda.status === 'in_procesare' || comanda.status === 'pregatit_pentru_livrare'
      ).length;

      // Calculate livrări programate (în tranzit cu data expediere astăzi)
      const livrariprogramate = allComenzi.filter(comanda => 
        comanda.status === 'in_tranzit' && 
        comanda.data_expediere && 
        comanda.data_expediere.startsWith(todayStr)
      ).length;

      // Calculate rute active (în tranzit cu AWB completat)
      const ruteActive = allComenzi.filter(comanda => 
        comanda.status === 'in_tranzit' && 
        comanda.awb && 
        comanda.awb.trim() !== ''
      ).length;

      // Calculate eficiența livrărilor (ultimele 30 de zile)
      const comenziUltimele30Zile = allComenzi.filter(comanda => 
        comanda.created_at >= thirtyDaysAgoStr
      );
      
      const comenziLivrate = comenziUltimele30Zile.filter(comanda => 
        comanda.status === 'livrata'
      ).length;

      const eficientaLivrari = comenziUltimele30Zile.length > 0 
        ? Math.round((comenziLivrate / comenziUltimele30Zile.length) * 100)
        : 0;

      console.log('Stats calculated:', {
        comenziInProcesare,
        livrariprogramate,
        ruteActive,
        eficientaLivrari
      });

      return {
        comenziInProcesare,
        livrariprogramate,
        ruteActive,
        eficientaLivrari
      };
    }
  });

  return {
    stats: stats || {
      comenziInProcesare: 0,
      livrariprogramate: 0,
      ruteActive: 0,
      eficientaLivrari: 0
    },
    loading
  };
}
