import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/types/comanda';

export function useComenzi() {
  const { user } = useAuth();
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
        .select('*') // Selectăm tot pentru a se potrivi cu tipul Comanda
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Eroare la preluarea comenzilor:', error.message);
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

  useEffect(() => {
    fetchComenzi();
  }, [fetchComenzi]);

  const createComanda = useCallback(async (comandaData: Omit<Comanda, 'id' | 'created_at'>, items: any[]) => {
    try {
      // 1. Creează comanda principală
      const { data: comandaNoua, error: comandaError } = await supabase
        .from('comenzi')
        .insert(comandaData)
        .select()
        .single();
      
      if (comandaError) throw comandaError;
      if (!comandaNoua) throw new Error("Comanda nu a putut fi creată.");

      // 2. Adaugă itemii la comandă
      const itemiData = items.map(item => ({
        comanda_id: comandaNoua.id,
        produs_id: item.produs_id,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar,
        total_linie: item.cantitate * item.pret_unitar,
      }));

      const { error: itemsError } = await supabase
        .from('itemi_comanda')
        .insert(itemiData);

      if (itemsError) throw itemsError;

      await fetchComenzi(); // Reîncarcă lista de comenzi
      return comandaNoua;

    } catch (error) {
      console.error('Eroare complexă la crearea comenzii cu itemi:', error);
      throw error;
    }
  }, [fetchComenzi]);

  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    if (!id) return null;
    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select('*, itemi_comanda(*, produse(*))') // Join cu itemi și produse
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Eroare la preluarea comenzii după ID:', error.message);
        return null;
      }
      return data as Comanda | null;
    } catch (e) {
      console.error('Excepție la preluarea comenzii după ID:', e);
      return null;
    }
  }, []);

  return {
    comenzi,
    loading,
    fetchComenzi,
    createComanda,
    getComandaById,
  };
}