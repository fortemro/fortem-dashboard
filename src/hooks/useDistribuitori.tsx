
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables } from '@/integrations/supabase/types';

type Distribuitor = Tables<'distribuitori'>;

export function useDistribuitori(filterByUser = false) {
  const { user } = useAuth();
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribuitori();
  }, [user, filterByUser]);

  const fetchDistribuitori = async () => {
    try {
      let query = supabase
        .from('distribuitori')
        .select('*')
        .eq('activ', true);

      // Filtrează după utilizatorul logat dacă este cerut
      if (filterByUser && user) {
        query = query.eq('mzv_alocat', user.id);
      }

      const { data, error } = await query.order('nume_companie');

      if (error) throw error;
      setDistribuitori(data || []);
    } catch (error) {
      console.error('Error fetching distribuitori:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    distribuitori,
    loading,
    refreshDistribuitori: fetchDistribuitori
  };
}
