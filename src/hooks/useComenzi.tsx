
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Comanda = Tables<'comenzi'>;
type ComandaInsert = TablesInsert<'comenzi'>;
type ItemComanda = Tables<'itemi_comanda'>;
type ItemComandaInsert = TablesInsert<'itemi_comanda'>;

export function useComenzi() {
  const { user } = useAuth();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchComenzi();
    }
  }, [user]);

  const fetchComenzi = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('comenzi')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComenzi(data || []);
    } catch (error) {
      console.error('Error fetching comenzi:', error);
    } finally {
      setLoading(false);
    }
  };

  const createComanda = async (
    comandaData: Omit<ComandaInsert, 'user_id' | 'numar_comanda'>,
    items: Omit<ItemComandaInsert, 'comanda_id'>[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    try {
      // Creează comanda
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert({
          ...comandaData,
          user_id: user.id
        })
        .select()
        .single();

      if (comandaError) throw comandaError;

      // Adaugă itemii comenzii
      const itemsWithComandaId = items.map(item => ({
        ...item,
        comanda_id: comanda.id
      }));

      const { error: itemsError } = await supabase
        .from('itemi_comanda')
        .insert(itemsWithComandaId);

      if (itemsError) throw itemsError;

      // Calculează și actualizează totalul comenzii
      const total = items.reduce((sum, item) => sum + (item.cantitate * item.pret_unitar), 0);
      
      const { error: updateError } = await supabase
        .from('comenzi')
        .update({ total })
        .eq('id', comanda.id);

      if (updateError) throw updateError;

      await fetchComenzi();
      return comanda;
    } catch (error) {
      console.error('Error creating comanda:', error);
      throw error;
    }
  };

  return {
    comenzi,
    loading,
    createComanda,
    refreshComenzi: fetchComenzi
  };
}
