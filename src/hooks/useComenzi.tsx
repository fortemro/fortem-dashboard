import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/types/comanda'; // Asigură-te că acest tip este corect definit

export function useComenzi() {
  const { user } = useAuth();
  // variabilele de stare pe care le-am omis anterior
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  // Funcția care încarcă lista de comenzi
  const fetchComenzi = useCallback(async () => {
    if (!user) {
      setComenzi([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Am scos coloana 'total_general' care producea eroarea
      const { data, error } = await supabase
        .from('comenzi')
        .select(`
          id,
          created_at,
          status,
          distribuitori ( nume )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Eroare la preluarea comenzilor:', error);
        setComenzi([]);
      } else {
        setComenzi(data || []);
      }
    } catch (e) {
      console.error('Exceptie la preluarea comenzilor:', e);
      setComenzi([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Hook ce rulează o singură dată pentru a încărca comenzile
  useEffect(() => {
    fetchComenzi();
  }, [fetchComenzi]);

  // Funcția de creare a comenzii, pe care am omis-o
  const createComanda = useCallback(async (comandaData: any) => {
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .insert([comandaData])
        .select()
        .single();

      if (error) {
        console.error('Eroare la crearea comenzii:', error);
        throw error;
      }
      
      // Reîncarcă lista de comenzi după crearea uneia noi
      await fetchComenzi();
      return data;
    } catch (e) {
      console.error('Excepție la crearea comenzii:', e);
      throw e;
    }
  }, [fetchComenzi]);

  // Funcția de citire a unei comenzi (versiunea sigură de data trecută)
  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select(`*, distribuitori(nume), comenzi_items(*, produse(nume))`)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Eroare la preluarea comenzii după ID:', error);
        return null;
      }
      return data as Comanda | null;
    } catch (e) {
      console.error('Excepție la preluarea comenzii după ID:', e);
      return null;
    }
  }, []);

  // Returnăm tot ce este necesar pentru restul aplicației
  return {
    comenzi,
    loading,
    fetchComenzi,
    createComanda,
    getComandaById,
  };
}