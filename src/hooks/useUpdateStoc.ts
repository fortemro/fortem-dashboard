
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateStoc() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ produsId, nouStoc }: { produsId: string, nouStoc: number }) => {
      console.log(`[useUpdateStoc] Updating stock for product ${produsId} to ${nouStoc}`);
      
      const { error } = await supabase
        .from("produse")
        .update({ stoc_disponibil: nouStoc })
        .eq("id", produsId);

      if (error) {
        console.error(`[useUpdateStoc] Error updating stock:`, error);
        throw new Error(error.message);
      }

      console.log(`[useUpdateStoc] Successfully updated stock for product ${produsId}`);
    },
    onSuccess: (_, { produsId, nouStoc }) => {
      console.log(`[useUpdateStoc] Stock update successful, invalidating caches...`);
      
      // Invalidăm TOATE cache-urile relevante pentru sincronizare completă
      const queriesToInvalidate = [
        ['produse'],                    // Hook principal produse
        ['dashboard_productie'],        // Dashboard Producție
        ['comenzi-logistica'],          // Portal Logistica
        ['logistica-stats'],            // Statistici Logistica
        ['stocuri-reale'],             // Stocuri reale calculate
        ['dashboard-productie'],        // Alt format pentru dashboard
        ['admin-stats'],               // Admin dashboard
        ['centralizator-data'],        // Centralizator
        ['panou-vanzari-data'],        // Panou vânzări
        ['executive-data']             // Dashboard executiv
      ];

      // Invalidăm toate query-urile pentru sincronizare maximă
      queriesToInvalidate.forEach(queryKey => {
        console.log(`[useUpdateStoc] Invalidating query:`, queryKey);
        queryClient.invalidateQueries({ queryKey });
      });

      // Forțăm refetch pentru query-uri critice
      queryClient.refetchQueries({ queryKey: ['produse'] });
      queryClient.refetchQueries({ queryKey: ['dashboard_productie'] });
      queryClient.refetchQueries({ queryKey: ['comenzi-logistica'] });

      console.log(`[useUpdateStoc] All caches invalidated and critical queries refetched`);
    },
    onError: (error, { produsId }) => {
      console.error(`[useUpdateStoc] Failed to update stock for product ${produsId}:`, error);
    }
  });

  return mutation;
}
