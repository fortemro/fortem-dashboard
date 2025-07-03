
// src/hooks/comenzi/useComandaCreate.tsx
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useDistribuitori } from '../useDistribuitori';
import { useQueryClient } from '@tanstack/react-query';
import { ItemComanda } from '@/data-types';

export function useComandaCreate() {
  const { user } = useAuth();
  const { findOrCreateDistribuitor } = useDistribuitori();
  const queryClient = useQueryClient();

  const createComanda = async (formData: any, items: Partial<ItemComanda>[]) => {
    if (!user) throw new Error('Nu ești autentificat');

    const { distribuitor_id: distributorName, ...restOfFormData } = formData;
    if (!distributorName) throw new Error('Numele distribuitorului este obligatoriu.');
    
    try {
      const distributorId = await findOrCreateDistribuitor(distributorName);
      if (!distributorId) throw new Error(`Distribuitorul "${distributorName}" nu a putut fi procesat.`);

      // Pregătesc itemii folosind prețurile introduse manual din formular
      const itemsWithPrices = await Promise.all(
        items.map(async (item) => {
          if (!item.produs_id) throw new Error('Produs ID lipsește pentru unul dintre itemii comenzii');
          
          // Verific că produsul există în baza de date și preiau numele + stocul curent
          const { data: produs, error: produsError } = await supabase
            .from('produse')
            .select('nume, stoc_disponibil')
            .eq('id', item.produs_id)
            .single();

          if (produsError || !produs) {
            console.error('Eroare la preluarea produsului:', produsError);
            throw new Error(`Nu s-a putut prelua informații pentru produsul ${item.produs_id}`);
          }

          // Verific dacă este stoc suficient
          const stocCurent = produs.stoc_disponibil || 0;
          const cantitateNecesara = item.cantitate || 0;
          
          if (stocCurent < cantitateNecesara) {
            throw new Error(`Stoc insuficient pentru produsul "${produs.nume}". Disponibil: ${stocCurent}, Necesar: ${cantitateNecesara}`);
          }

          // Folosesc prețul introdus manual din formular, NU cel din baza de date
          const pretUnitar = item.pret_unitar || 0;
          
          // Validez că prețul manual este > 0
          if (pretUnitar <= 0) {
            throw new Error(`Prețul pentru produsul "${produs.nume}" trebuie să fie mai mare decât 0`);
          }
          
          const totalItem = pretUnitar * cantitateNecesara;

          return {
            produs_id: item.produs_id,
            cantitate: cantitateNecesara,
            pret_unitar: pretUnitar,
            total_item: totalItem,
            nume_produs: produs.nume,
            stoc_curent: stocCurent, // Pentru actualizare ulterioară
          };
        })
      );

      // Calculez totalul comenzii
      const totalComanda = itemsWithPrices.reduce((sum, item) => sum + item.total_item, 0);
      const totalPaleti = itemsWithPrices.reduce((sum, item) => sum + item.cantitate, 0);

      console.log('[useComandaCreate] Calculare total comandă:', { totalComanda, totalPaleti, itemsWithPrices });

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

      // Creez comanda
      const { data: comanda, error: comandaError } = await supabase.from('comenzi').insert(comandaPentruInserare).select().single();
      if (comandaError) throw comandaError;

      // Creez itemii comenzii
      const itemsData = itemsWithPrices.map(item => ({
        comanda_id: comanda.id,
        produs_id: item.produs_id!,
        cantitate: item.cantitate!,
        pret_unitar: item.pret_unitar!,
        total_item: item.total_item!,
      }));
      
      const { error: itemsError } = await supabase.from('itemi_comanda').insert(itemsData);
      if (itemsError) throw itemsError;

      // **PASUL CRITIC**: Actualizez stocul fizic pentru fiecare produs comandat
      console.log('[useComandaCreate] Actualizez stocurile fizice pentru produsele comandate...');
      
      for (const item of itemsWithPrices) {
        const noulStoc = item.stoc_curent - item.cantitate;
        console.log(`[useComandaCreate] Actualizez stocul pentru ${item.nume_produs}: ${item.stoc_curent} -> ${noulStoc}`);
        
        const { error: stocError } = await supabase
          .from('produse')
          .update({ stoc_disponibil: noulStoc })
          .eq('id', item.produs_id);

        if (stocError) {
          console.error(`[useComandaCreate] Eroare la actualizarea stocului pentru ${item.nume_produs}:`, stocError);
          throw new Error(`Nu s-a putut actualiza stocul pentru produsul ${item.nume_produs}`);
        }
      }

      console.log('[useComandaCreate] Stocurile fizice au fost actualizate cu succes!');

      // Invalidez cache-ul produselor pentru a reîncărca stocurile în toată aplicația
      await queryClient.invalidateQueries({ queryKey: ['produse'] });
      await queryClient.invalidateQueries({ queryKey: ['dashboard_productie'] });
      await queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      console.log('[useComandaCreate] Cache-ul produselor a fost invalidat - stocurile vor fi reîncărcate');

      // Încerc să trimit email-ul, dar nu blochez procesul dacă fail-uiește
      try {
        console.log('[useComandaCreate] Attempting to send order email...');
        const emailData = {
          comandaId: comanda.id,
          numarul_comanda: comanda.numar_comanda,
          distribuitor: distributorName,
          oras_livrare: restOfFormData.oras_livrare,
          adresa_livrare: restOfFormData.adresa_livrare,
          telefon_livrare: restOfFormData.telefon_livrare,
          items: itemsWithPrices,
          total_comanda: totalComanda,
          data_comanda: comanda.data_comanda,
        };

        const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-order-email', {
          body: emailData
        });

        if (emailError) {
          console.error('[useComandaCreate] Eroare la trimiterea email-ului:', emailError);
        } else {
          console.log('[useComandaCreate] Email trimis cu succes:', emailResult);
        }
      } catch (emailError) {
        console.error('[useComandaCreate] Excepție la trimiterea email-ului:', emailError);
        // Nu arunc eroarea - comanda a fost creată cu succes
      }

      // Returnez datele complete pentru popup
      return {
        ...comanda,
        distribuitor_nume: distributorName,
        items: itemsWithPrices,
      };
    } catch (error) {
      console.error('[useComandaCreate] Eroare în fluxul de creare a comenzii:', error);
      throw error;
    }
  };
  return { createComanda };
}
