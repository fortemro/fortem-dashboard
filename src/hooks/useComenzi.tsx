
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

      // Validare de bază
      if (!comandaData.distribuitor_id) {
        throw new Error('Distribuitor ID este obligatoriu');
      }

      if (!comandaData.oras_livrare || !comandaData.adresa_livrare) {
        throw new Error('Orașul și adresa de livrare sunt obligatorii');
      }

      // Găsește distribuitor-ul pentru a determina MZV-ul responsabil
      const { data: distribuitor, error: distributorError } = await supabase
        .from('distribuitori')
        .select('mzv_alocat, nume_companie')
        .eq('id', comandaData.distribuitor_id)
        .single();

      if (distributorError) {
        console.error('Error fetching distribuitor:', distributorError);
        throw new Error('Nu s-a putut găsi distribuitor-ul');
      }

      // Determină MZV-ul pentru comandă
      let mzvEmitent = user.id; // fallback la utilizatorul logat
      
      if (distribuitor?.mzv_alocat) {
        mzvEmitent = distribuitor.mzv_alocat;
        console.log('Using allocated MZV for distribuitor:', distribuitor.nume_companie, 'MZV:', mzvEmitent);
      } else {
        console.log('No MZV allocated for distribuitor, using current user as MZV:', user.id);
      }

      // Creează comanda cu statusul corect pentru constraint-ul din baza de date
      const insertData: any = {
        ...comandaData,
        user_id: user.id,
        status: 'in_asteptare', // Folosesc status-ul exact din constraint: 'in_asteptare'
        mzv_emitent: mzvEmitent,
        data_comanda: new Date().toISOString(),
        oras_livrare: comandaData.oras_livrare,
        adresa_livrare: comandaData.adresa_livrare,
        judet_livrare: comandaData.judet_livrare || '',
        telefon_livrare: comandaData.telefon_livrare || '',
        observatii: comandaData.observatii || '',
        numar_paleti: comandaData.numar_paleti || 0
      };

      console.log('Insert data for comanda (with correct status):', insertData);

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(insertData)
        .select()
        .single();

      if (comandaError) {
        console.error('Error creating comanda:', comandaError);
        console.error('Insert data was:', insertData);
        
        // Afișez o eroare mai clară pentru utilizator
        if (comandaError.code === '23514' && comandaError.message.includes('comenzi_status_check')) {
          throw new Error('Valoarea status-ului nu este validă. Contactați administratorul.');
        }
        
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
