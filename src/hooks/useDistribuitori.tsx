
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Distribuitor = Tables<'distribuitori'>;

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDistribuitori();
  }, []);

  const fetchDistribuitori = async () => {
    try {
      const { data, error } = await supabase
        .from('distribuitori')
        .select('*')
        .eq('activ', true)
        .order('nume_companie');

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
