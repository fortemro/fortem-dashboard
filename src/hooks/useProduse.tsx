
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

export function useProduse() {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduse();
  }, []);

  const fetchProduse = async () => {
    try {
      const { data, error } = await supabase
        .from('produse')
        .select('*')
        .eq('activ', true)
        .order('nume');

      if (error) throw error;
      setProduse(data || []);
    } catch (error) {
      console.error('Error fetching produse:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    produse,
    loading,
    refreshProduse: fetchProduse
  };
}
