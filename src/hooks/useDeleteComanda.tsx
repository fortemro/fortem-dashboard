
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteComanda() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (comandaId: string) => {
      console.log(`[useDeleteComanda] Încep ștergerea comenzii ${comandaId}`);

      // 1. Preiau itemii comenzii pentru a restabili stocurile (doar dacă nu e deja anulată)
      const { data: comandaData, error: comandaFetchError } = await supabase
        .from('comenzi')
        .select('status')
        .eq('id', comandaId)
        .single();

      if (comandaFetchError) {
        console.error('[useDeleteComanda] Eroare la preluarea statusului comenzii:', comandaFetchError);
        throw comandaFetchError;
      }

      // Restabilesc stocul doar dacă comanda nu era deja anulată
      if (comandaData.status !== 'anulata') {
        console.log('[useDeleteComanda] Comanda nu era anulată - restabilesc stocurile');
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select('produs_id, cantitate')
          .eq('comanda_id', comandaId);

        if (itemsError) {
          console.error('[useDeleteComanda] Eroare la preluarea itemilor:', itemsError);
          throw itemsError;
        }

        // Restabilesc stocul pentru fiecare produs
        for (const item of itemsData || []) {
          const { data: produs, error: produsError } = await supabase
            .from('produse')
            .select('nume, stoc_disponibil')
            .eq('id', item.produs_id)
            .single();

          if (produsError || !produs) {
            console.error(`[useDeleteComanda] Eroare la preluarea produsului ${item.produs_id}:`, produsError);
            continue; // Nu blochez procesul pentru o eroare la un produs
          }

          const stocCurent = produs.stoc_disponibil || 0;
          const noulStoc = stocCurent + item.cantitate;
          
          console.log(`[useDeleteComanda] Restabilesc stocul pentru ${produs.nume}: ${stocCurent} -> ${noulStoc}`);

          const { error: stocError } = await supabase
            .from('produse')
            .update({ stoc_disponibil: noulStoc })
            .eq('id', item.produs_id);

          if (stocError) {
            console.error(`[useDeleteComanda] Eroare la restabilirea stocului pentru ${produs.nume}:`, stocError);
            // Nu arunc eroare - continui cu ștergerea
          }
        }
      } else {
        console.log('[useDeleteComanda] Comanda era deja anulată - nu restabilesc stocurile');
      }

      // 2. Șterg itemii comenzii
      const { error: deleteItemsError } = await supabase
        .from('itemi_comanda')
        .delete()
        .eq('comanda_id', comandaId);

      if (deleteItemsError) {
        console.error('[useDeleteComanda] Eroare la ștergerea itemilor:', deleteItemsError);
        throw deleteItemsError;
      }

      // 3. Șterg comanda
      const { error: deleteComandaError } = await supabase
        .from('comenzi')
        .delete()
        .eq('id', comandaId);

      if (deleteComandaError) {
        console.error('[useDeleteComanda] Eroare la ștergerea comenzii:', deleteComandaError);
        throw deleteComandaError;
      }

      console.log(`[useDeleteComanda] Comanda ${comandaId} a fost ștearsă cu succes`);
      return comandaId;
    },
    onSuccess: () => {
      // Invalidez toate cache-urile relevante
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_productie'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['centralizator-data'] });
      
      toast({
        title: "Comandă ștearsă",
        description: "Comanda a fost ștearsă cu succes și stocurile au fost restabilite.",
      });
    },
    onError: (error: any) => {
      console.error('[useDeleteComanda] Eroare la ștergerea comenzii:', error);
      toast({
        title: "Eroare la ștergere",
        description: error.message || "A apărut o eroare la ștergerea comenzii",
        variant: "destructive",
      });
    },
  });

  return {
    deleteComanda: mutation.mutate,
    isDeleting: mutation.isPending,
  };
}
