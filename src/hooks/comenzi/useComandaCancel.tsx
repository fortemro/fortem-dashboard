import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useComandaCancel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (comandaId: string) => {
      console.log('[useComandaCancel] Începe anularea comenzii:', comandaId);

      // 1. Obțin itemii comenzii pentru a restabili stocurile scriptice
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('produs_id, cantitate')
        .eq('comanda_id', comandaId);

      if (itemsError) {
        console.error('[useComandaCancel] Eroare la preluarea itemilor:', itemsError);
        throw new Error('Nu s-au putut prelua itemii comenzii pentru anulare');
      }

      console.log('[useComandaCancel] Items preluați pentru anulare:', itemsData);

      // 2. Pentru fiecare item, restabilesc stocul scriptic
      console.log('[useComandaCancel] Restabilesc stocurile scriptice...');
      
      for (const item of itemsData || []) {
        // Obțin informații despre produs
        const { data: produs, error: produsError } = await supabase
          .from('produse')
          .select('nume, stoc_disponibil')
          .eq('id', item.produs_id)
          .single();

        if (produsError) {
          console.error('[useComandaCancel] Eroare la preluarea produsului:', produsError);
          throw new Error(`Nu s-au putut prelua informații pentru produsul ${item.produs_id}`);
        }

        // Calculez noul stoc scriptic (ADAUG ÎNAPOI cantitatea anulată)
        const stocCurent = produs.stoc_disponibil || 0;
        const noulStoc = stocCurent + item.cantitate;
        
        console.log(`[useComandaCancel] Produs: ${produs.nume}, Stoc curent scriptic: ${stocCurent}, Cantitate anulată: ${item.cantitate}, Noul stoc scriptic: ${noulStoc}`);

        // Actualizez stocul scriptic în baza de date
        const { error: stocError } = await supabase
          .from('produse')
          .update({ stoc_disponibil: noulStoc })
          .eq('id', item.produs_id);

        if (stocError) {
          console.error(`[useComandaCancel] Eroare la restabilirea stocului pentru ${produs.nume}:`, stocError);
          throw new Error(`Nu s-a putut restabili stocul pentru produsul ${produs.nume}`);
        }

        console.log(`[useComandaCancel] ✅ Stocul scriptic pentru ${produs.nume} a fost restabilit cu succes`);
      }

      // 3. Marchez comanda ca fiind anulată
      const { error: comandaError } = await supabase
        .from('comenzi')
        .update({ 
          status: 'anulata',
          data_anulare: new Date().toISOString(),
          anulat_de: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', comandaId);

      if (comandaError) {
        console.error('[useComandaCancel] Eroare la anularea comenzii:', comandaError);
        throw comandaError;
      }

      console.log(`[useComandaCancel] ✅ Comanda ${comandaId} a fost anulată cu succes și stocurile scriptice au fost restabilite`);

      return { success: true };
    },
    onSuccess: () => {
      // Invalidez TOATE cache-urile relevante pentru a forța reîncărcarea datelor
      console.log('[useComandaCancel] Invalidez cache-urile pentru actualizare...');
      
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_productie'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['centralizator-data'] });
      
      // Forțez și un refetch explicit pentru produse
      queryClient.refetchQueries({ queryKey: ['produse'] });
      
      toast({
        title: "Comandă anulată",
        description: "Comanda a fost anulată cu succes și stocurile fizice au fost restabilite.",
      });
    },
    onError: (error: any) => {
      console.error('[useComandaCancel] Eroare la anularea comenzii:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut anula comanda. Încercați din nou.",
        variant: "destructive",
      });
    }
  });
}
