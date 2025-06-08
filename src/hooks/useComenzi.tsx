// src/hooks/useComenzi.tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/data-types';

export function useComenzi() {
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComenzi = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select('*, distribuitori ( nume_companie )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComenzi(data as any[] || []);
    } catch (e) {
      console.error('Eroare la preluarea comenzilor:', e);
      setComenzi([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchComenzi(); }, [fetchComenzi]);
  
  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    // ... implementarea existentă este ok
  }, []);

  return { comenzi, loading, fetchComenzi, getComandaById };
}