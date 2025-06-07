
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

export function useProduse(distributorName?: string, showAll: boolean = false) {
  const [produse, setProduse] = useState<Produs[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduse();
  }, [distributorName, showAll]);

  const fetchProduse = async () => {
    try {
      let query = supabase
        .from('produse')
        .select(`
          *,
          distribuitor:distribuitori(*)
        `)
        .eq('activ', true);

      // Filtrează după distribuitor doar dacă este specificat și nu vrem să afișăm toate
      if (distributorName && !showAll) {
        // Pentru că acum distribuitor_id din comenzi este text (numele distribuitorului),
        // trebuie să căutăm în tabela distribuitori după nume și să filtrăm produsele
        const { data: distribuitori, error: distributorError } = await supabase
          .from('distribuitori')
          .select('id')
          .ilike('nume_companie', `%${distributorName}%`);

        if (distributorError) {
          console.error('Error fetching distribuitor:', distributorError);
        } else if (distribuitori && distribuitori.length > 0) {
          const distributorIds = distribuitori.map(d => d.id);
          query = query.in('distribuitor_id', distributorIds);
        } else {
          // Dacă nu găsim distribuitor cu numele dat, returnăm array gol
          setProduse([]);
          setLoading(false);
          return;
        }
      }

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
