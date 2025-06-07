
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import type { ComandaInsert, ItemComandaInsert } from '@/types/comanda';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor } = useDistribuitori();

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
        throw new Error('Numele distribuitorului este obligatoriu');
      }

      if (!comandaData.oras_livrare || !comandaData.adresa_livrare) {
        throw new Error('Orașul și adresa de livrare sunt obligatorii');
      }

      // Calculează numărul total de paleți din items
      const totalPaleti = items.reduce((sum, item) => sum + (item.cantitate || 0), 0);

      // Întotdeauna găsește sau creează distribuitor-ul în baza de date
      console.log('Finding or creating distributor:', comandaData.distribuitor_id);
      const distribuitor = await findOrCreateDistribuitor(comandaData.distribuitor_id);
      const distributorId = distribuitor.id;
      const mzvEmitent = distribuitor.mzv_alocat || user.id;
      console.log('Using distribuitor with ID:', distributorId, 'MZV:', mzvEmitent);

      // Creează comanda cu distributorId ca UUID
      const insertData: any = {
        ...comandaData,
        user_id: user.id,
        status: 'in_asteptare',
        mzv_emitent: mzvEmitent,
        data_comanda: new Date().toISOString(),
        distribuitor_id: distributorId,
        oras_livrare: comandaData.oras_livrare,
        adresa_livrare: comandaData.adresa_livrare,
        judet_livrare: comandaData.judet_livrare || '',
        telefon_livrare: comandaData.telefon_livrare || '',
        observatii: comandaData.observatii || '',
        numar_paleti: totalPaleti
      };

      console.log('Insert data for comanda:', insertData);

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(insertData)
        .select()
        .single();

      if (comandaError) {
        console.error('Error creating comanda:', comandaError);
        console.error('Insert data was:', insertData);
        
        if (comandaError.code === '23514' && comandaError.message.includes('comenzi_status_check')) {
          throw new Error('Valoarea status-ului nu este validă. Contactați administratorul.');
        }
        
        throw comandaError;
      }

      console.log('Comanda created successfully:', comanda);

      // Adaugă itemii comenzii
      const itemsWithComandaId = items.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id,
        cantitate: item.cantitate,
        pret_unitar: item.pret_unitar,
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
      return comanda;
    } catch (error) {
      console.error('Error creating comanda:', error);
      throw error;
    }
  };

  return { createComanda };
}
