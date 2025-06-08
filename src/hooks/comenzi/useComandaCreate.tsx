import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { ItemComanda } from '@/data-types';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor } = useDistribuitori();

  const createComanda = async (
    formData: any,
    items: Partial<ItemComanda>[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    const {
        distribuitor_id: distributorName,
        pret_per_palet,
        numar_paleti
    } = formData;

    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu.');
    
    try {
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);

      const totalComandaCalculat = (Number(numar_paleti) || 0) * (Number(pret_per_palet) || 0);

      const comandaPentruInserare = {
        ...formData,
        distribuitor_id: distributorId,
        user_id: user.id,
        status: 'in_asteptare',
        data_comanda: new Date().toISOString(),
        numar_comanda: `CMD-${Date.now().toString().slice(-6)}`,
        mzv_emitent: user.id,
        total_comanda: totalComandaCalculat,
      };

      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(comandaPentruInserare)
        .select()
        .single();

      if (comandaError) throw comandaError;

      // REVIZUIRE: Adăugăm câmpurile obligatorii pentru a satisface DB-ul
      const itemsData = items.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id!,
        cantitate: item.cantitate!,
        pret_unitar: 0, // Compromis tehnic
        total_item: 0, // Compromis tehnic
      }));

      const { error: itemsError } = await supabase.from('itemi_comanda').insert(itemsData);
      if (itemsError) throw itemsError;

      return comanda;
    } catch (error) {
      console.error('Eroare în fluxul de creare a comenzii:', error);
      throw error;
    }
  };

  return { createComanda };
}