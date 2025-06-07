
import { supabase } from '@/integrations/supabase/client';

export function useComandaDetails() {
  const getComandaById = async (comandaId: string) => {
    try {
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .select('*')
        .eq('id', comandaId)
        .single();

      if (comandaError) throw comandaError;

      // Get distribuitor details if available
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
        items: itemsWithProducts || [],
        distribuitor: distributorDetails
      };
    } catch (error) {
      console.error('Error fetching comanda by id:', error);
      throw error;
    }
  };

  return { getComandaById };
}
