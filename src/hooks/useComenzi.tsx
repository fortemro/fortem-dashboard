
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Comanda = Tables<'comenzi'>;
type ComandaInsert = Omit<TablesInsert<'comenzi'>, 'user_id' | 'numar_comanda' | 'id' | 'created_at' | 'updated_at'>;
type ItemComanda = Tables<'itemi_comanda'>;
type ItemComandaInsert = Omit<TablesInsert<'itemi_comanda'>, 'comanda_id' | 'id' | 'created_at' | 'total_item'>;

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
    comandaData: ComandaInsert,
    items: ItemComandaInsert[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    try {
      // Creează comanda - nu includem numar_comanda pentru că va fi generat automat de trigger
      const insertData: any = {
        ...comandaData,
        user_id: user.id
      };

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(insertData)
        .select()
        .single();

      if (comandaError) throw comandaError;

      // Adaugă itemii comenzii
      const itemsWithComandaId = items.map(item => ({
        ...item,
        comanda_id: comanda.id,
        total_item: item.cantitate * item.pret_unitar
      }));

      const { error: itemsError } = await supabase
        .from('itemi_comanda')
        .insert(itemsWithComandaId);

      if (itemsError) throw itemsError;

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
