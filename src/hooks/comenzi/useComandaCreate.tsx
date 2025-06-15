
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
          
          // Verific că produsul există în baza de date și preiau numele
          const { data: produs, error: produsError } = await supabase
            .from('produse')
            .select('nume')
            .eq('id', item.produs_id)
            .single();

          if (produsError || !produs) {
            console.error('Eroare la preluarea produsului:', produsError);
            throw new Error(`Nu s-a putut prelua informații pentru produsul ${item.produs_id}`);
          }

          // Folosesc prețul introdus manual din formular, NU cel din baza de date
          const pretUnitar = item.pret_unitar || 0;
          const cantitate = item.cantitate || 0;
          
          // Validez că prețul manual este > 0
          if (pretUnitar <= 0) {
            throw new Error(`Prețul pentru produsul "${produs.nume}" trebuie să fie mai mare decât 0`);
          }
          
          const totalItem = pretUnitar * cantitate;

          return {
            produs_id: item.produs_id,
            cantitate: cantitate,
            pret_unitar: pretUnitar, // Folosesc prețul din formular
            total_item: totalItem,
            nume_produs: produs.nume,
          };
        })
      );

      // Calculez totalul comenzii
      const totalComanda = itemsWithPrices.reduce((sum, item) => sum + item.total_item, 0);
      const totalPaleti = itemsWithPrices.reduce((sum, item) => sum + item.cantitate, 0);

      console.log('Calculare total comandă:', { totalComanda, totalPaleti, itemsWithPrices });

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

      // Invalidez cache-ul produselor pentru a reîncărca stocurile reale în toată aplicația
      await queryClient.invalidateQueries({ queryKey: ['produse'] });
      console.log('Cache-ul produselor a fost invalidat - stocurile vor fi reîncărcate');

      // Încerc să trimit email-ul, dar nu blochez procesul dacă fail-uiește
      try {
        console.log('Attempting to send order email...');
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
          console.error('Eroare la trimiterea email-ului:', emailError);
        } else {
          console.log('Email trimis cu succes:', emailResult);
        }
      } catch (emailError) {
        console.error('Excepție la trimiterea email-ului:', emailError);
        // Nu arunc eroarea - comanda a fost creată cu succes
      }

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
