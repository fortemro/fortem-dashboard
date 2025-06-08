import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/types/comanda';

// Omit<Type, Keys> creează un tip nou omițând anumite proprietăți
type ComandaCreateData = Omit<Comanda, 'id' | 'created_at' | 'numar_comanda' | 'status' | 'user_id'> & {
    items: any[];
};

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
      const { data, error } = await supabase.from('comenzi').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
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

  useEffect(() => { fetchComenzi(); }, [fetchComenzi]);

  const createComanda = useCallback(async (formData: any) => {
    if (!user) throw new Error("Utilizatorul nu este autentificat.");

    const { items, ...comandaDetails } = formData;

    const comandaDataToInsert = {
      ...comandaDetails,
      user_id: user.id,
      status: 'plasata',
      data_comanda: new Date().toISOString(),
      numar_comanda: `CMD-${Math.floor(Math.random() * 100000)}`,
      mzv_emitent: 'N/A', // Valoare implicită
      awb: '',
      document_url: ''
    };

    try {
      const { data: comandaNoua, error: comandaError } = await supabase
        .from('comenzi')
        .insert(comandaDataToInsert)
        .select()
        .single();
      
      if (comandaError) throw comandaError;
      if (!comandaNoua) throw new Error("Comanda nu a putut fi creată.");

      const itemiData = items.map((item: any) => ({
        comanda_id: comandaNoua.id,
        produs_id: item.produs_id,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar,
        total_item: item.cantitate * item.pret_unitar, // Am corectat 'total_linie' în 'total_item'
      }));

      const { error: itemsError } = await supabase.from('itemi_comanda').insert(itemiData);
      if (itemsError) throw itemsError;

      await fetchComenzi();
      return comandaNoua;

    } catch (error) {
      console.error('Eroare la crearea comenzii cu itemi:', error);
      throw error;
    }
  }, [user, fetchComenzi]);

  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    if (!id) return null;
    try {
      const { data, error } = await supabase.from('comenzi').select('*, itemi_comanda(*, produse(*))').eq('id', id).maybeSingle();
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

  return { comenzi, loading, fetchComenzi, createComanda, getComandaById };
}