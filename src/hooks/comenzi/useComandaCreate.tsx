
// src/hooks/comenzi/useComandaCreate.tsx
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { ItemComanda } from '@/data-types';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor } = useDistribuitori();

  const createComanda = async (formData: any, items: Partial<ItemComanda>[]) => {
    if (!user) throw new Error('Nu ești autentificat');

    const { distribuitor_id: distributorName, ...restOfFormData } = formData;
    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu.');
    
    try {
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);

      // Pregătesc itemii cu prețurile reale din baza de date
      const itemsWithPrices = await Promise.all(
        items.map(async (item) => {
          if (!item.produs_id) throw new Error('Produs ID lipsește pentru unul dintre itemii comenzii');
          
          // Preiau prețul produsului din baza de date
          const { data: produs, error: produsError } = await supabase
            .from('produse')
            .select('pret, nume')
            .eq('id', item.produs_id)
            .single();

          if (produsError || !produs) {
            console.error('Eroare la preluarea prețului produsului:', produsError);
            throw new Error(`Nu s-a putut prelua prețul pentru produsul ${item.produs_id}`);
          }

          const pretUnitar = produs.pret || 0;
          const cantitate = item.cantitate || 0;
          const totalItem = pretUnitar * cantitate;

          return {
            produs_id: item.produs_id,
            cantitate: cantitate,
            pret_unitar: pretUnitar,
            total_item: totalItem,
            nume_produs: produs.nume,
          };
        })
      );

      // Calculez totalul comenzii
      const totalComanda = itemsWithPrices.reduce((sum, item) => sum + item.total_item, 0);
      const totalPaleti = itemsWithPrices.reduce((sum, item) => sum + item.cantitate, 0);

      const comandaPentruInserare = {
        ...restOfFormData,
        distribuitor_id: distributorId,
        user_id: user.id,
        status: 'in_asteptare',
        data_comanda: new Date().toISOString(),
        numar_comanda: `CMD-${Date.now().toString().slice(-6)}`,
        mzv_emitent: user.id,
        numar_paleti: totalPaleti,
        total_comanda: totalComanda,
      };

      const { data: comanda, error: comandaError } = await supabase.from('comenzi').insert(comandaPentruInserare).select().single();
      if (comandaError) throw comandaError;

      const itemsData = itemsWithPrices.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id!,
        cantitate: item.cantitate!,
        pret_unitar: item.pret_unitar!,
        total_item: item.total_item!,
      }));
      
      const { error: itemsError } = await supabase.from('itemi_comanda').insert(itemsData);
      if (itemsError) throw itemsError;

      // Returnez datele complete pentru popup
      return {
        ...comanda,
        distribuitor_nume: distributorName,
        items: itemsWithPrices,
      };
    } catch (error) {
      console.error('Eroare în fluxul de creare a comenzii:', error);
      throw error;
    }
  };
  return { createComanda };
}
