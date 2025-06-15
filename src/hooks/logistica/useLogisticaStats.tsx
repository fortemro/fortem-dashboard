
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

      // Query all relevant data - make sure we get ALL orders
      const { data: allComenzi, error } = await supabase
        .from('comenzi')
        .select('id, status, data_expediere, numar_masina, nume_transportator, created_at, data_comanda')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching comenzi for stats:', error);
        throw error;
      }

      console.log('Total comenzi found for stats:', allComenzi?.length || 0);

      // Get products for stock critical calculation
      const { data: produse, error: produseError } = await supabase
        .from('produse')
        .select('id, nume, stoc_disponibil, prag_alerta_stoc')
        .eq('activ', true);

      if (produseError) {
        console.error('Error fetching products for stock stats:', produseError);
      }

      // Get real stock data
      const { data: stocuriReale, error: stocuriError } = await supabase
        .rpc('get_stocuri_reale_pentru_produse');

      if (stocuriError) {
        console.error('Error fetching real stock:', stocuriError);
      }

      if (!allComenzi) {
        return {
          comenziInProcesare: 0,
          comenziCuTransportAlocat: 0,
          comenziExpediateAstazi: 0,
          stocCritic: 0,
          eficientaLivrari: 0
        };
      }

      // Calculate comenzi în procesare (in_procesare + in_asteptare)
      const comenziInProcesare = allComenzi.filter(comanda => 
        comanda.status === 'in_procesare' || 
        comanda.status === 'in_asteptare'
      ).length;

      // Calculate comenzi cu transport alocat (have both nume_transportator and numar_masina)
      const comenziCuTransportAlocat = allComenzi.filter(comanda => 
        comanda.nume_transportator && 
        comanda.nume_transportator.trim() !== '' &&
        comanda.numar_masina && 
        comanda.numar_masina.trim() !== '' &&
        (comanda.status === 'in_procesare' || comanda.status === 'in_asteptare')
      ).length;

      // Calculate comenzi expediate astăzi (with expedition date today)
      const comenziExpediateAstazi = allComenzi.filter(comanda => 
        comanda.data_expediere && 
        comanda.data_expediere.startsWith(todayStr)
      ).length;

      // Calculate stoc critic (products with real stock below alert threshold)
      let stocCritic = 0;
      if (produse && stocuriReale) {
        const stocuriMap = new Map(
          stocuriReale.map(item => [item.produs_id, item.stoc_real])
        );

        stocCritic = produse.filter(produs => {
          const stocReal = stocuriMap.get(produs.id) || 0;
          const pragAlerta = produs.prag_alerta_stoc || 10;
          return stocReal <= pragAlerta;
        }).length;
      }

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
        comenziCuTransportAlocat,
        comenziExpediateAstazi,
        stocCritic,
        eficientaLivrari,
        totalComenzi: allComenzi.length
      });

      return {
        comenziInProcesare,
        comenziCuTransportAlocat,
        comenziExpediateAstazi,
        stocCritic,
        eficientaLivrari
      };
    }
  });

  return {
    stats: stats || {
      comenziInProcesare: 0,
      comenziCuTransportAlocat: 0,
      comenziExpediateAstazi: 0,
      stocCritic: 0,
      eficientaLivrari: 0
    },
    loading
  };
}
