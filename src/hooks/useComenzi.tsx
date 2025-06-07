
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { Tables, TablesInsert } from '@/integrations/supabase/types';

type Comanda = Tables<'comenzi'> & {
  items?: ItemComanda[];
  calculated_paleti?: number;
};
type ComandaInsert = Omit<TablesInsert<'comenzi'>, 'user_id' | 'numar_comanda' | 'id' | 'created_at' | 'updated_at' | 'data_comanda'>;
type ItemComanda = Tables<'itemi_comanda'> & {
  produs?: Tables<'produse'>;
};
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
      // Fetch comenzi
      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (comenziError) throw comenziError;

      // Fetch items for each comanda separately to avoid relationship ambiguity
      const comenziWithItems = await Promise.all(
        (comenziData || []).map(async (comanda) => {
          // First get the items
          const { data: itemsData, error: itemsError } = await supabase
            .from('itemi_comanda')
            .select('*')
            .eq('comanda_id', comanda.id);

          if (itemsError) {
            console.error('Error fetching items for comanda:', comanda.id, itemsError);
          }

          // Then get product details for each item
          const itemsWithProducts = await Promise.all(
            (itemsData || []).map(async (item) => {
              const { data: productData, error: productError } = await supabase
                .from('produse')
                .select('id, nume, dimensiuni, bucati_per_palet')
                .eq('id', item.produs_id)
                .single();

              if (productError) {
                console.error('Error fetching product for item:', item.id, productError);
              }

              return {
                ...item,
                produs: productData || undefined
              };
            })
          );

          // Calculate total paleti from items
          const calculatedPaleti = itemsWithProducts.reduce((total, item) => {
            return total + (item.cantitate || 0);
          }, 0);

          return {
            ...comanda,
            items: itemsWithProducts,
            calculated_paleti: calculatedPaleti
          };
        })
      );

      setComenzi(comenziWithItems);
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
        throw new Error('Numele distribuitorului este obligatoriu');
      }

      if (!comandaData.oras_livrare || !comandaData.adresa_livrare) {
        throw new Error('Orașul și adresa de livrare sunt obligatorii');
      }

      // Calculează numărul total de paleți din items
      const totalPaleti = items.reduce((sum, item) => sum + (item.cantitate || 0), 0);

      // Opțional: verifică dacă distribuitor-ul există, dacă nu îl creează
      const distributorName = comandaData.distribuitor_id.trim();
      
      // Verifică dacă există un distribuitor cu acest nume
      const { data: existingDistributor } = await supabase
        .from('distribuitori')
        .select('id, nume_companie, mzv_alocat')
        .ilike('nume_companie', distributorName)
        .single();

      let mzvEmitent = user.id; // fallback la utilizatorul logat
      
      if (existingDistributor?.mzv_alocat) {
        mzvEmitent = existingDistributor.mzv_alocat;
        console.log('Using allocated MZV for distribuitor:', existingDistributor.nume_companie, 'MZV:', mzvEmitent);
      } else {
        console.log('No MZV allocated for distribuitor or distribuitor not found, using current user as MZV:', user.id);
      }

      // Creează comanda cu statusul corect pentru constraint-ul din baza de date
      const insertData: any = {
        ...comandaData,
        user_id: user.id,
        status: 'in_asteptare',
        mzv_emitent: mzvEmitent,
        data_comanda: new Date().toISOString(),
        distribuitor_id: distributorName, // Salvăm numele ca text
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

      await fetchComenzi();
      return comanda;
    } catch (error) {
      console.error('Error creating comanda:', error);
      throw error;
    }
  };

  const getComandaById = async (comandaId: string) => {
    try {
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('id', comandaId)
        .single();

      if (comandaError) throw comandaError;

      // Get items separately
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('*')
        .eq('comanda_id', comandaId);

      if (itemsError) throw itemsError;

      // Get product details for each item
      const itemsWithProducts = await Promise.all(
        (itemsData || []).map(async (item) => {
          const { data: productData, error: productError } = await supabase
            .from('produse')
            .select('id, nume, dimensiuni, bucati_per_palet')
            .eq('id', item.produs_id)
            .single();

          if (productError) {
            console.error('Error fetching product for item:', item.id, productError);
          }

          return {
            ...item,
            produs: productData || undefined
          };
        })
      );

      return {
        ...comanda,
        items: itemsWithProducts || []
      };
    } catch (error) {
      console.error('Error fetching comanda by id:', error);
      throw error;
    }
  };

  return {
    comenzi,
    loading,
    createComanda,
    refreshComenzi: fetchComenzi,
    getComandaById
  };
}
