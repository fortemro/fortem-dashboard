// src/hooks/comenzi/useComandaCreate.tsx
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { ItemComanda } from '@/data-types';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor, distribuitori } = useDistribuitori();

  const createComanda = async (
    formData: any,
    items: Partial<ItemComanda>[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    const distributorName = formData.distribuitor_id; // Numele vine din formular
    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu.');
    
    try {
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);

      const distribuitorObject = distribuitori.find(d => d.id === distributorId);
      const mzvEmitent = distribuitorObject?.mzv_alocat || user.id;

      const comandaPentruInserare = {
        ...formData,
        distribuitor_id: distributorId,
        user_id: user.id,
        mzv_emitent: mzvEmitent,
        status: 'in_asteptare',
        data_comanda: new Date().toISOString(),
        numar_comanda: `CMD-${Date.now().toString().slice(-6)}`,
        total_comanda: (Number(formData.numar_paleti) || 0) * (Number(formData.pret_per_palet) || 0),
      };

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(comandaPentruInserare)
        .select()
        .single();
      if (comandaError) throw comandaError;

      const itemsData = items.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id!,
        cantitate: item.cantitate!,
        pret_unitar: 0,
        total_item: 0,
      }));
      await supabase.from('itemi_comanda').insert(itemsData);

      return comanda;
    } catch (error) {
      console.error('Eroare în fluxul de creare a comenzii:', error);
      throw error;
    }
  };

  return { createComanda };
}