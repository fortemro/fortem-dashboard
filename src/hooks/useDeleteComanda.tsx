
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useDeleteComanda() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async ({ comandaId, motivAnulare }: { comandaId: string; motivAnulare?: string }) => {
      console.log('Starting order cancellation:', { comandaId, motivAnulare, userId: user?.id });
      
      const { data, error } = await supabase.functions.invoke('delete-order', {
        body: { comandaId, motivAnulare }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message);
      }

      if (!data.success) {
        console.error('Cancellation failed:', data.error);
        throw new Error(data.error || 'Eroare necunoscută la anularea comenzii');
      }

      console.log('Order cancellation successful:', data);
      return data;
    },
    onMutate: async ({ comandaId }) => {
      console.log('Optimistic update: removing order from UI', comandaId);
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comenzi', user?.id] });

      // Snapshot the previous value
      const previousComenzi = queryClient.getQueryData(['comenzi', user?.id]);

      // Optimistically update to remove the order
      queryClient.setQueryData(['comenzi', user?.id], (old: any[]) => {
        if (!old) return [];
        const filtered = old.filter(comanda => comanda.id !== comandaId);
        console.log('Optimistic update applied, orders remaining:', filtered.length);
        return filtered;
      });

      return { previousComenzi };
    },
    onError: (error: Error, { comandaId }, context) => {
      console.error('Order cancellation failed, reverting:', error.message);
      
      // Revert the optimistic update
      if (context?.previousComenzi) {
        queryClient.setQueryData(['comenzi', user?.id], context.previousComenzi);
      }

      toast({
        title: "Eroare la anularea comenzii",
        description: error.message,
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      console.log('Order cancellation confirmed, invalidating all related queries');
      
      // Invalidate all related queries to ensure sync across all modules
      const queriesToInvalidate = [
        ['comenzi'],
        ['comenzi-anulate'],
        ['comenzi-logistica'],
        ['produse'],
        ['stocuri-reale'],
        ['logistica-stats'],
        ['dashboard-productie'],
        ['admin-stats'],
        ['centralizator-data'],
        ['panou-vanzari-data']
      ];

      queriesToInvalidate.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });

      toast({
        title: "Comandă anulată cu succes",
        description: data.message,
        variant: "default"
      });
    },
    onSettled: () => {
      // Always refetch the main orders list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['comenzi', user?.id] });
    }
  });

  return {
    deleteComanda: (comandaId: string, motivAnulare?: string) => {
      console.log('Delete command received:', { comandaId, motivAnulare });
      return mutation.mutate({ comandaId, motivAnulare });
    },
    isDeleting: mutation.isPending,
    error: mutation.error
  };
}
