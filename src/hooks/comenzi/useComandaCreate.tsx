import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { Comanda, ItemComanda } from '@/data-types'; // Folosim tipurile centrale

export function useComandaCreate() {
  const { user } = useAuth();
  // Preluăm întreaga listă de distribuitori pentru a găsi obiectul complet
  const { distribuitori, findOrCreateDistribuitor } = useDistribuitori();

  const createComanda = async (
    comandaData: Partial<Comanda>,
    items: Partial<ItemComanda>[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    // Numele distribuitorului vine din formular în câmpul `distribuitor_id`
    const distributorName = comandaData.distribuitor_id as unknown as string;
    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu');

    try {
      // 1. Găsește sau creează distribuitorul și obține ID-ul (un string)
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) {
        throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);
      }

      // 2. REZOLVARE: Caută obiectul complet al distribuitorului în listă pentru a-i accesa proprietățile
      const distribuitorObject = distribuitori.find(d => d.id === distributorId);
      const mzvEmitent = distribuitorObject?.mzv_alocat || user.id;

      // 3. Pregătește datele pentru inserare
      const insertData = {
        ...comandaData,
        distribuitor_id: distributorId, // Folosim ID-ul corect (UUID)
        user_id: user.id,
        mzv_emitent: mzvEmitent,
        status: 'in_asteptare',
        data_comanda: new Date().toISOString(),
        numar_comanda: `CMD-${Date.now().toString().slice(-6)}`,
        numar_paleti: items.reduce((sum, item) => sum + (item.cantitate || 0), 0),
      };

      // 4. Inserează comanda principală
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .insert(insertData)
        .select()
        .single();

      if (comandaError) throw comandaError;

      // 5. Inserează itemii comenzii
      const itemsWithComandaId = items.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id!,
        cantitate: item.cantitate!,
        pret_unitar: item.pret_unitar!,
        total_item: (item.cantitate || 0) * (item.pret_unitar || 0),
      }));

      const { error: itemsError } = await supabase.from('itemi_comanda').insert(itemsWithComandaId);
      if (itemsError) throw itemsError;

      return comanda;
    } catch (error) {
      console.error('Eroare în hook-ul createComanda:', error);
      throw error;
    }
  };

  return { createComanda };
}