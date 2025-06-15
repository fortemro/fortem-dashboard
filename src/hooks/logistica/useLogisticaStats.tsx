
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useLogisticaStats() {
  const { data: stats = {
    comenziInProcesare: 0,
    comenziCuTransportAlocat: 0,
    comenziExpediateAstazi: 0,
    stocCritic: 0,
    comenziAnulate: 0
  }, isLoading: loading } = useQuery({
    queryKey: ['logistica-stats'],
    queryFn: async () => {
      console.log('Fetching logistica stats...');

      // Get comenzi în procesare (în așteptare + în procesare)
      const { data: comenziInProcesare, error: errorProcesare } = await supabase
        .from('comenzi')
        .select('id')
        .in('status', ['in_asteptare', 'in_procesare']);

      if (errorProcesare) {
        console.error('Error fetching comenzi in procesare:', errorProcesare);
      }

      // Get comenzi cu transport alocat
      const { data: comenziCuTransport, error: errorTransport } = await supabase
        .from('comenzi')
        .select('id')
        .not('nume_transportator', 'is', null)
        .not('numar_masina', 'is', null)
        .in('status', ['in_procesare', 'pregatit_pentru_livrare', 'in_tranzit']);

      if (errorTransport) {
        console.error('Error fetching comenzi cu transport:', errorTransport);
      }

      // Get comenzi expediate astăzi
      const today = new Date().toISOString().split('T')[0];
      const { data: comenziExpediateAstazi, error: errorExpediate } = await supabase
        .from('comenzi')
        .select('id')
        .gte('data_expediere', `${today}T00:00:00.000Z`)
        .lte('data_expediere', `${today}T23:59:59.999Z`);

      if (errorExpediate) {
        console.error('Error fetching comenzi expediate astazi:', errorExpediate);
      }

      // Get stoc critic
      const { data: stocCritic, error: errorStoc } = await supabase
        .from('produse')
        .select('id')
        .lt('stoc_disponibil', 'prag_alerta_stoc');

      if (errorStoc) {
        console.error('Error fetching stoc critic:', errorStoc);
      }

      // Get comenzi anulate
      const { data: comenziAnulate, error: errorAnulate } = await supabase
        .from('comenzi')
        .select('id')
        .eq('status', 'anulata');

      if (errorAnulate) {
        console.error('Error fetching comenzi anulate:', errorAnulate);
      }

      const result = {
        comenziInProcesare: (comenziInProcesare || []).length,
        comenziCuTransportAlocat: (comenziCuTransport || []).length,
        comenziExpediateAstazi: (comenziExpediateAstazi || []).length,
        stocCritic: (stocCritic || []).length,
        comenziAnulate: (comenziAnulate || []).length
      };

      console.log('Logistica stats result:', result);
      return result;
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // refresh every minute
  });

  return { stats, loading };
}
