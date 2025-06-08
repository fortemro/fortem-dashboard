import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth'; // Am verificat că importul există
import { Comanda } from '@/data-types';

export function useComenzi() {
  const { user } = useAuth(); // Adăugăm linia care definește utilizatorul
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComenzi = useCallback(async () => {
    if (!user) {
      setComenzi([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select('*, distribuitori ( nume_companie )')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Eroare la preluarea comenzilor:', error.message);
        setComenzi([]);
      } else {
        setComenzi((data as any[]) || []);
      }
    } catch (e) {
      console.error('Exceptie la preluarea comenzilor:', e);
      setComenzi([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchComenzi(); }, [fetchComenzi]);
  
  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select('*, itemi_comanda(*, produse(*)), distribuitori(*)')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Eroare la preluarea comenzii după ID:', error.message);
        return null;
      }
      return data as unknown as Comanda | null;
    } catch (e) {
      console.error('Excepție la preluarea comenzii după ID:', e);
      return null;
    }
  }, []);

  return { comenzi, loading, fetchComenzi, getComandaById };
}