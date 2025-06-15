
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export function useDeleteComanda() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const mutation = useMutation({
    mutationFn: async (comandaId: string) => {
      const { data, error } = await supabase.functions.invoke('delete-order', {
        body: { comandaId }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Eroare necunoscută la ștergerea comenzii');
      }

      return data;
    },
    onMutate: async (comandaId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['comenzi', user?.id] });

      // Snapshot the previous value
      const previousComenzi = queryClient.getQueryData(['comenzi', user?.id]);

      // Optimistically remove the order
      queryClient.setQueryData(['comenzi', user?.id], (old: any[]) => {
        if (!old) return [];
        return old.filter(comanda => comanda.id !== comandaId);
      });

      // Return a context object with the snapshotted value
      return { previousComenzi };
    },
    onError: (error: Error, comandaId, context) => {
      // Revert the optimistic update
      if (context?.previousComenzi) {
        queryClient.setQueryData(['comenzi', user?.id], context.previousComenzi);
      }

      toast({
        title: "Eroare la ștergerea comenzii",
        description: error.message,
        variant: "destructive"
      });
    },
    onSuccess: (data) => {
      // Invalidate and refetch all relevant cache
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['stocuri-reale'] });
      queryClient.invalidateQueries({ queryKey: ['logistica-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-productie'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      toast({
        title: "Comandă ștearsă",
        description: data.message,
        variant: "default"
      });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['comenzi', user?.id] });
    }
  });

  return {
    deleteComanda: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error
  };
}
