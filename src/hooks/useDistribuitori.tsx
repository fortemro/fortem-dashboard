// src/hooks/useDistribuitori.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Distribuitor } from '@/data-types';

export function useDistribuitori() {
  const [distribuitori, setDistribuitori] = useState<Distribuitor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDistribuitori = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('distribuitori').select('*').order('nume_companie', { ascending: true });
      if (error) throw error;
      setDistribuitori(data || []);
    } catch (e) {
      console.error('Eroare la preluarea distribuitorilor:', e);
      setDistribuitori([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDistribuitori(); }, [fetchDistribuitori]);

  const findOrCreateDistribuitor = useCallback(async (numeCompanie: string): Promise<string | null> => {
    if (!numeCompanie?.trim()) return null;
    try {
      let { data: existing } = await supabase.from('distribuitori').select('id').eq('nume_companie', numeCompanie.trim()).single();
      if (existing) return existing.id;

      const { data: created, error } = await supabase.from('distribuitori').insert({ nume_companie: numeCompanie.trim(), adresa: 'N/A', oras: 'N/A' }).select('id').single();
      if (error) throw error;
      
      await fetchDistribuitori();
      return created!.id;
    } catch (error: any) {
      if (error.code !== 'PGRST116') console.error("Eroare în findOrCreateDistribuitor:", error);
      return null; // Returnează null în caz de eroare, pentru a fi gestionat mai sus
    }
  }, [fetchDistribuitori]);

  return { distribuitori, loading, findOrCreateDistribuitor };
}