
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

export function useProduse(distributorId?: string) {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduse();
  }, [distributorId]);

  const fetchProduse = async () => {
    try {
      let query = supabase
        .from('produse')
        .select('*')
        .eq('activ', true);

      // Nu mai filtrăm după distribuitor - încărcăm toate produsele
      // Utilizatorul poate alege orice produs din lista completă

      const { data, error } = await query.order('nume');

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
