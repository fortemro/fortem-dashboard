
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import type { Comanda } from '@/types/comanda';

export function useComenziData() {
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

          // Get distribuitor details if distribuitor_id is a UUID
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
            }
          }

          // Calculate total paleti from items
          const calculatedPaleti = itemsWithProducts.reduce((total, item) => {
            return total + (item.cantitate || 0);
          }, 0);

          return {
            ...comanda,
            items: itemsWithProducts,
            calculated_paleti: calculatedPaleti,
            distribuitor: distributorDetails
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

  return {
    comenzi,
    loading,
    refreshComenzi: fetchComenzi
  };
}
