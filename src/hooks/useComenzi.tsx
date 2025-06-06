
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Comanda = Tables<'comenzi'>;
type ComandaInsert = Omit<TablesInsert<'comenzi'>, 'user_id' | 'numar_comanda' | 'id' | 'created_at' | 'updated_at' | 'data_comanda'>;
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
      console.log('Creating comanda with data:', comandaData);
      console.log('Creating comanda with items:', items);

      // Creează comanda cu statusul 'Nouă' și mzv_emitent setat la ID-ul utilizatorului logat
      const insertData: any = {
        ...comandaData,
        user_id: user.id,
        status: 'Nouă',
        mzv_emitent: user.id, // ID-ul utilizatorului logat în câmpul mzv_emitent
        data_comanda: new Date().toISOString()
      };

      console.log('Insert data for comanda:', insertData);

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(insertData)
        .select()
        .single();

      if (comandaError) {
        console.error('Error creating comanda:', comandaError);
        throw comandaError;
      }

      console.log('Comanda created successfully:', comanda);

      // Adaugă itemii comenzii - salvează cantitatea și prețul din pret_vanzare_manual
      const itemsWithComandaId = items.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar, // acest câmp vine din pret_vanzare_manual din formular
        total_item: item.cantitate * item.pret_unitar
      }));

      console.log('Items to insert:', itemsWithComandaId);

      const { error: itemsError } = await supabase
        .from('itemi_comanda')
        .insert(itemsWithComandaId);

      if (itemsError) {
        console.error('Error creating items:', itemsError);
        throw itemsError;
      }

      console.log('Items created successfully');

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
