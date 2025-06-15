
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Comanda } from '@/data-types';

export function useComenziAnulateGlobal() {
  const {
    data: comenziAnulate = [],
    isLoading: loading,
    refetch,
    error
  } = useQuery({
    queryKey: ['comenzi-anulate-global'],
    queryFn: async () => {
      console.log('Fetching all cancelled orders globally...');

      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('status', 'anulata')
        .order('data_anulare', { ascending: false });

      if (comenziError) {
        console.error('Eroare la preluarea comenzilor anulate:', comenziError.message);
        throw new Error(comenziError.message);
      }

      const comenziWithDetails = await Promise.all(
        (comenziData || []).map(async (comanda) => {
          let distributorInfo = null;
          
          const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
          
          if (isUUID) {
            const { data: distributorData, error: distributorError } = await supabase
              .from('distribuitori')
              .select('*')
              .eq('id', comanda.distribuitor_id)
              .single();

            if (!distributorError && distributorData) {
              distributorInfo = distributorData;
            }
          }

          // Get user profile for the order owner
          let userProfile = null;
          if (comanda.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiluri_utilizatori')
              .select('nume_complet')
              .eq('user_id', comanda.user_id)
              .single();

            if (!profileError && profileData) {
              userProfile = profileData;
            }
          }

          // Get user profile for who cancelled the order
          let profileAnulatDe = null;
          if (comanda.anulat_de) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiluri_utilizatori')
              .select('nume_complet')
              .eq('user_id', comanda.anulat_de)
              .single();

            if (!profileError && profileData) {
              profileAnulatDe = profileData;
            }
          }

          return {
            ...comanda,
            distribuitori: distributorInfo,
            profiluri_utilizatori: userProfile,
            profile_anulat_de: profileAnulatDe
          };
        })
      );

      console.log('Fetched global cancelled orders:', comenziWithDetails.length);
      return comenziWithDetails as Comanda[];
    },
    staleTime: 30000,
    gcTime: 5 * 60 * 1000,
  });

  return { 
    comenziAnulate, 
    loading, 
    refetch,
    error
  };
}
