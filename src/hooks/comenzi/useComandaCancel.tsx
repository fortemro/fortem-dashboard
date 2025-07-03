
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { toast } from '@/hooks/use-toast';

export function useComandaCancel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const cancelComanda = useMutation({
    mutationFn: async ({ comandaId, motiv }: { comandaId: string; motiv: string }) => {
      if (!user) throw new Error('Nu ești autentificat');

      console.log(`[useComandaCancel] Încep anularea comenzii ${comandaId}`);

      // 1. Preiau itemii comenzii pentru a restabili stocurile
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('produs_id, cantitate')
        .eq('comanda_id', comandaId);

      if (itemsError) {
        console.error('[useComandaCancel] Eroare la preluarea itemilor comenzii:', itemsError);
        throw new Error('Nu s-au putut prelua itemii comenzii pentru anulare');
      }

      // 2. Pentru fiecare item, restabilesc stocul fizic
      console.log('[useComandaCancel] Restabilesc stocurile fizice...');
      
      for (const item of itemsData || []) {
        // Preiau stocul curent
        const { data: produs, error: produsError } = await supabase
          .from('produse')
          .select('nume, stoc_disponibil')
          .eq('id', item.produs_id)
          .single();

        if (produsError || !produs) {
          console.error(`[useComandaCancel] Eroare la preluarea produsului ${item.produs_id}:`, produsError);
          throw new Error(`Nu s-au putut prelua informații pentru produsul ${item.produs_id}`);
        }

        // Calculez noul stoc (adaug înapoi cantitatea anulată)
        const stocCurent = produs.stoc_disponibil || 0;
        const noulStoc = stocCurent + item.cantitate;
        
        console.log(`[useComandaCancel] Restabilesc stocul pentru ${produs.nume}: ${stocCurent} -> ${noulStoc} (+${item.cantitate})`);

        // Actualizez stocul în baza de date
        const { error: stocError } = await supabase
          .from('produse')
          .update({ stoc_disponibil: noulStoc })
          .eq('id', item.produs_id);

        if (stocError) {
          console.error(`[useComandaCancel] Eroare la restabilirea stocului pentru ${produs.nume}:`, stocError);
          throw new Error(`Nu s-a putut restabili stocul pentru produsul ${produs.nume}`);
        }
      }

      // 3. Marchez comanda ca fiind anulată
      const { error: comandaError } = await supabase
        .from('comenzi')
        .update({
          status: 'anulata',
          data_anulare: new Date().toISOString(),
          anulat_de: user.id,
          motiv_anulare: motiv
        })
        .eq('id', comandaId);

      if (comandaError) {
        console.error('[useComandaCancel] Eroare la anularea comenzii:', comandaError);
        throw comandaError;
      }

      console.log(`[useComandaCancel] Comanda ${comandaId} a fost anulată cu succes și stocurile au fost restabilite`);

      return { success: true };
    },
    onSuccess: () => {
      // Invalidez toate cache-urile relevante
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_productie'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['centralizator-data'] });
      
      toast({
        title: "Comandă anulată",
        description: "Comanda a fost anulată cu succes și stocurile au fost restabilite.",
      });
    },
    onError: (error: any) => {
      console.error('[useComandaCancel] Eroare la anularea comenzii:', error);
      toast({
        title: "Eroare",
        description: `Nu s-a putut anula comanda: ${error.message}`,
        variant: "destructive"
      });
    }
  });

  return cancelComanda;
}
