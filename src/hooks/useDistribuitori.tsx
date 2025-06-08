import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Distribuitor {
  id: string;
  name: string;
}

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistribuitori = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('distribuitori')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) {
        console.error('Eroare la preluarea distribuitorilor:', error.message);
        setDistribuitori([]);
      } else {
        setDistribuitori(data || []);
      }
    } catch (e) {
      console.error('Excepție la preluarea distribuitorilor:', e);
      setDistribuitori([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDistribuitori();
  }, [fetchDistribuitori]);

  const findOrCreateDistribuitor = useCallback(async (distributorName: string): Promise<string | null> => {
    if (!distributorName.trim()) {
        console.error("Numele distribuitorului nu poate fi gol.");
        return null;
    }
    
    try {
        const { data: existing, error: searchError } = await supabase
          .from('distribuitori')
          .select('id')
          .eq('name', distributorName)
          .single();

        if (existing) {
          return existing.id;
        }

        if (searchError && searchError.code !== 'PGRST116') { // PGRST116 = rândul nu a fost găsit
          throw searchError;
        }
        
        const { data: created, error: createError } = await supabase
          .from('distribuitori')
          .insert({ name: distributorName })
          .select('id')
          .single();

        if (createError) throw createError;
        
        await fetchDistribuitori();
        return created!.id;

    } catch(error) {
        console.error("Eroare în findOrCreateDistribuitor:", error);
        return null;
    }
  }, [fetchDistribuitori]);

  return { distribuitori, loading, findOrCreateDistribuitor };
}