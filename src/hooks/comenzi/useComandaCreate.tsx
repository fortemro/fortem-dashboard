import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { Comanda, ItemComanda } from '@/data-types';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor } = useDistribuitori();

  const createComanda = async (
    formData: any, // Datele din formular
    items: Partial<ItemComanda>[]
  ) => {
    if (!user) throw new Error('Nu ești autentificat');

    const {
        distribuitor_id: distributorName, // Numele vine în acest câmp
        oras_livrare,
        adresa_livrare,
        judet_livrare,
        telefon_livrare,
        observatii,
        numar_paleti,
        pret_per_palet
    } = formData;

    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu.');
    if (!numar_paleti || !pret_per_palet) throw new Error('Numărul de paleți și prețul per palet sunt obligatorii.');

    try {
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);

      // Calculul simplificat
      const totalComandaCalculat = (Number(numar_paleti) || 0) * (Number(pret_per_palet) || 0);

      const comandaPentruInserare = {
        distribuitor_id: distributorId,
        user_id: user.id,
        status: 'in_asteptare',
        data_comanda: new Date().toISOString(),
        numar_comanda: `CMD-${Date.now().toString().slice(-6)}`,
        mzv_emitent: user.id,
        oras_livrare,
        adresa_livrare,
        judet_livrare,
        telefon_livrare,
        observatii: observatii || '',
        numar_paleti: Number(numar_paleti),
        pret_per_palet: Number(pret_per_palet), // Salvăm și prețul per palet dacă există coloana
        total_comanda: totalComandaCalculat,
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