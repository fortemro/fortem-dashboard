import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useDeleteComanda() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (comandaId: string) => {
      console.log('[useDeleteComanda] Începe ștergerea comenzii:', comandaId);

      // 1. Verific statusul comenzii
      const { data: comanda, error: comandaError } = await supabase
        .from('comenzi')
        .select('status')
        .eq('id', comandaId)
        .single();

      if (comandaError) {
        console.error('[useDeleteComanda] Eroare la verificarea statusului comenzii:', comandaError);
        throw comandaError;
      }

      // 2. Dacă comanda NU este deja anulată, restabilesc stocurile scriptice
      if (comanda.status !== 'anulata') {
        console.log('[useDeleteComanda] Comanda nu era anulată - restabilesc stocurile scriptice...');
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('itemi_comanda')
          .select('produs_id, cantitate')
          .eq('comanda_id', comandaId);

        if (itemsError) {
          console.error('[useDeleteComanda] Eroare la preluarea itemilor:', itemsError);
          throw itemsError;
        }

        console.log('[useDeleteComanda] Items preluați pentru restabilire:', itemsData);

        // Restabilesc stocul scriptic pentru fiecare produs
        for (const item of itemsData || []) {
          const { data: produs, error: produsError } = await supabase
            .from('produse')
            .select('nume, stoc_disponibil')
            .eq('id', item.produs_id)
            .single();

          if (produsError) {
            console.error('[useDeleteComanda] Eroare la preluarea produsului:', produsError);
            throw new Error(`Nu s-au putut prelua informații pentru produsul ${item.produs_id}`);
          }

          const stocCurent = produs.stoc_disponibil || 0;
          const noulStoc = stocCurent + item.cantitate;
          
          console.log(`[useDeleteComanda] Produs: ${produs.nume}, Stoc curent scriptic: ${stocCurent}, Cantitate de restabilit: ${item.cantitate}, Noul stoc scriptic: ${noulStoc}`);

          const { error: stocError } = await supabase
            .from('produse')
            .update({ stoc_disponibil: noulStoc })
            .eq('id', item.produs_id);

          if (stocError) {
            console.error(`[useDeleteComanda] Eroare la restabilirea stocului pentru ${produs.nume}:`, stocError);
            throw new Error(`Nu s-a putut restabili stocul pentru produsul ${produs.nume}`);
          }

          console.log(`[useDeleteComanda] ✅ Stocul scriptic pentru ${produs.nume} a fost restabilit cu succes`);
        }
      } else {
        console.log('[useDeleteComanda] Comanda era deja anulată - nu restabilesc stocurile scriptice');
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
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-anulate'] });
      toast({
        title: "Succes",
        description: "Comanda a fost ștearsă cu succes.",
      });
    },
    onError: (error: any) => {
      console.error('[useDeleteComanda] Eroare la ștergerea comenzii:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut șterge comanda. Încercați din nou.",
        variant: "destructive",
      });
    }
  });
}
