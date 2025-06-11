
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Comanda } from '@/data-types';

export function useComenzi() {
  const { user } = useAuth();
  const [comenzi, setComenzi] = useState<Comanda[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComenzi = useCallback(async () => {
    if (!user) {
      setComenzi([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: comenziData, error: comenziError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (comenziError) {
        console.error('Eroare la preluarea comenzilor:', comenziError.message);
        setComenzi([]);
      } else {
        const comenziWithDistributors = await Promise.all(
          (comenziData || []).map(async (comanda) => {
            let distributorInfo = null;
            
            const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
            
            if (isUUID) {
              const { data: distributorData, error: distributorError } = await supabase
                .from('distribuitori')
                .select('*')
                .eq('id', comanda.distribuitor_id)
                .single();

              if (!distributorError && distributorData) {
                distributorInfo = distributorData;
              }
            }

            return {
              ...comanda,
              distribuitori: distributorInfo
            };
          })
        );

        setComenzi(comenziWithDistributors as Comanda[]);
      }
    } catch (e) {
      console.error('Exceptie la preluarea comenzilor:', e);
      setComenzi([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { 
    fetchComenzi(); 
  }, [fetchComenzi]);
  
  // Stable function for getting order by ID
  const getComandaById = useCallback(async (id: string): Promise<Comanda | null> => {
    if (!id) {
      console.log('No ID provided to getComandaById');
      return null;
    }
    
    console.log('getComandaById called with ID:', id);
    
    try {
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('id', id)
        .single();

      if (comandaError) {
        console.error('Eroare la preluarea comenzii după ID:', comandaError.message);
        return null;
      }

      console.log('Comanda found:', comanda);

      let distributorDetails = null;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(comanda.distribuitor_id);
      
      if (isUUID) {
        const { data: distributorData, error: distributorError } = await supabase
          .from('distribuitori')
          .select('*')
          .eq('id', comanda.distribuitor_id)
          .single();

        if (!distributorError && distributorData) {
          distributorDetails = distributorData;
          console.log('Distributor details found:', distributorDetails);
        }
      }

      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('*')
        .eq('comanda_id', id);

      if (itemsError) {
        console.error('Eroare la preluarea itemilor:', itemsError.message);
      }

      console.log('Items found:', itemsData);

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

      const result = {
        ...comanda,
        items: itemsWithProducts || [],
        distribuitor: distributorDetails
      } as unknown as Comanda;

      console.log('Final result:', result);
      return result;
    } catch (e) {
      console.error('Excepție la preluarea comenzii după ID:', e);
      return null;
    }
  }, []);

  return { comenzi, loading, fetchComenzi, getComandaById };
}
