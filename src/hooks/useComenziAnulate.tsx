
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/data-types';

export function useComenziAnulate() {
  const { user } = useAuth();

  const {
    data: comenziAnulate = [],
    isLoading: loading,
    refetch,
    error
  } = useQuery({
    queryKey: ['comenzi-anulate', user?.id],
    queryFn: async () => {
      if (!user) return [];

      console.log('Fetching comenzi anulate for user:', user.id);

      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'anulata')
        .order('data_anulare', { ascending: false });

      if (comenziError) {
        console.error('Eroare la preluarea comenzilor anulate:', comenziError.message);
        throw new Error(comenziError.message);
      }

      const comenziWithDistributors = await Promise.all(
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

          // Get user profile for who cancelled the order
          let profileInfo = null;
          if (comanda.anulat_de) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiluri_utilizatori')
              .select('nume_complet')
              .eq('user_id', comanda.anulat_de)
              .single();

            if (!profileError && profileData) {
              profileInfo = profileData;
            }
          }

          return {
            ...comanda,
            distribuitori: distributorInfo,
            profile_anulat_de: profileInfo
          };
        })
      );

      console.log('Fetched comenzi anulate:', comenziWithDistributors.length);
      return comenziWithDistributors as Comanda[];
    },
    enabled: !!user,
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
