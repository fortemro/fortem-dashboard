
import { supabase } from '@/integrations/supabase/client';
import { ComandaWithItems, ItemComanda, ProfileData } from '@/types/adminStats';

export const useAdminStatsData = () => {
  const fetchComenzi = async (dateFrom?: string, dateTo?: string) => {
    let comenziQuery = supabase
      .from('comenzi')
      .select('id, data_comanda, mzv_emitent, distribuitor_id, status');

    if (dateFrom) {
      comenziQuery = comenziQuery.gte('data_comanda', dateFrom);
    }
    if (dateTo) {
      comenziQuery = comenziQuery.lte('data_comanda', dateTo);
    }

    const { data, error } = await comenziQuery;
    if (error) {
      console.error('Error fetching comenzi:', error);
      throw error;
    }
    return data as ComandaWithItems[];
  };

  const fetchDistribuitori = async () => {
    const { data, error } = await supabase
      .from('distribuitori')
      .select('nume_companie');

    if (error) {
      console.error('Error fetching distribuitori:', error);
      throw error;
    }
    return data;
  };

  const fetchItemsForComenzi = async (comenziIds: string[]) => {
    if (comenziIds.length === 0) return [];

    const { data, error } = await supabase
      .from('itemi_comanda')
      .select(`
        comanda_id,
        cantitate,
        pret_unitar,
        total_item,
        produs_id,
        produse (
          nume
        )
      `)
      .in('comanda_id', comenziIds);

    if (error) {
      console.error('Error fetching items:', error);
      throw error;
    }
    return data as ItemComanda[];
  };

  const fetchProfiles = async () => {
    const { data, error } = await supabase
      .from('profiluri_utilizatori')
      .select('user_id, nume, prenume');

    if (error) {
      console.error('Error fetching profiles:', error);
      throw error;
    }
    return data as ProfileData[];
  };

  return {
    fetchComenzi,
    fetchDistribuitori,
    fetchItemsForComenzi,
    fetchProfiles
  };
};
