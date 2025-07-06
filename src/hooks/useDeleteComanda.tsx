
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useDeleteComanda() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (comandaId: string) => {
      console.log(`[useDeleteComanda] Încep ștergerea comenzii ${comandaId}`);

      // 1. Preiau comanda pentru a verifica statusul
      const { data: comandaData, error: comandaFetchError } = await supabase
        .from('comenzi')
        .select('status')
        .eq('id', comandaId)
        .single();

      if (comandaFetchError) {
        console.error('[useDeleteComanda] Eroare la preluarea statusului comenzii:', comandaFetchError);
        throw comandaFetchError;
      }

      // 2. Doar dacă comanda nu era deja anulată, restabilesc stocurile fizice
      if (comandaData.status !== 'anulata') {
        console.log('[useDeleteComanda] Comanda nu era anulată - restabilesc stocurile fizice');
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select('produs_id, cantitate')
          .eq('comanda_id', comandaId);

        if (itemsError) {
          console.error('[useDeleteComanda] Eroare la preluarea itemilor:', itemsError);
          throw itemsError;
        }

        console.log('[useDeleteComanda] Items preluați pentru restabilire:', itemsData);

        // Restabilesc stocul fizic pentru fiecare produs
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
          
          console.log(`[useDeleteComanda] Restabilesc stocul fizic pentru ${produs.nume}: ${stocCurent} -> ${noulStoc} (+${item.cantitate})`);

          const { error: stocError } = await supabase
            .from('produse')
            .update({ stoc_disponibil: noulStoc })
            .eq('id', item.produs_id);

          if (stocError) {
            console.error(`[useDeleteComanda] Eroare la restabilirea stocului pentru ${produs.nume}:`, stocError);
            throw new Error(`Nu s-a putut restabili stocul pentru produsul ${produs.nume}`);
          }

          console.log(`[useDeleteComanda] ✅ Stocul pentru ${produs.nume} a fost restabilit cu succes`);
        }
      } else {
        console.log('[useDeleteComanda] Comanda era deja anulată - nu restabilesc stocurile fizice');
      }

      // 3. Șterg itemii comenzii
      const { error: deleteItemsError } = await supabase
        .from('itemi_comanda')
        .delete()
        .eq('comanda_id', comandaId);

      if (deleteItemsError) {
        console.error('[useDeleteComanda] Eroare la ștergerea itemilor:', deleteItemsError);
        throw deleteItemsError;
      }

      // 4. Șterg comanda
      const { error: deleteComandaError } = await supabase
        .from('comenzi')
        .delete()
        .eq('id', comandaId);

      if (deleteComandaError) {
        console.error('[useDeleteComanda] Eroare la ștergerea comenzii:', deleteComandaError);
        throw deleteComandaError;
      }

      console.log(`[useDeleteComanda] ✅ Comanda ${comandaId} a fost ștearsă cu succes`);
      return comandaId;
    },
    onSuccess: () => {
      // Invalidez TOATE cache-urile relevante pentru a forța reîncărcarea datelor
      console.log('[useDeleteComanda] Invalidez cache-urile pentru actualizare...');
      
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_productie'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['centralizator-data'] });
      
      // Forțez și un refetch explicit pentru produse
      queryClient.refetchQueries({ queryKey: ['produse'] });
      
      toast({
        title: "Comandă ștearsă",
        description: "Comanda a fost ștearsă cu succes și stocurile fizice au fost restabilite.",
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
