
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
      const { data, error } = await supabase.functions.invoke('delete-order', {
        body: { comandaId, motivAnulare }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || 'Eroare necunoscută la anularea comenzii');
      }

      return data;
    },
    onMutate: async ({ comandaId }) => {
      await queryClient.cancelQueries({ queryKey: ['comenzi', user?.id] });

      const previousComenzi = queryClient.getQueryData(['comenzi', user?.id]);

      queryClient.setQueryData(['comenzi', user?.id], (old: any[]) => {
        if (!old) return [];
        return old.filter(comanda => comanda.id !== comandaId);
      });

      return { previousComenzi };
    },
    onError: (error: Error, { comandaId }, context) => {
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
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-anulate'] });
      queryClient.invalidateQueries({ queryKey: ['comenzi-logistica'] });
      queryClient.invalidateQueries({ queryKey: ['produse'] });
      queryClient.invalidateQueries({ queryKey: ['stocuri-reale'] });
      queryClient.invalidateQueries({ queryKey: ['logistica-stats'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-productie'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });

      toast({
        title: "Comandă anulată",
        description: data.message,
        variant: "default"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['comenzi', user?.id] });
    }
  });

  return {
    deleteComanda: (comandaId: string, motivAnulare?: string) => 
      mutation.mutate({ comandaId, motivAnulare }),
    isDeleting: mutation.isPending,
    error: mutation.error
  };
}
