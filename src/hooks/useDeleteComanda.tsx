
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function useDeleteComanda() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

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
    onSuccess: (data) => {
      // Invalidăm toate cache-urile relevante pentru a forța recalcularea stocurilor
      queryClient.invalidateQueries({ queryKey: ['comenzi'] });
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
    onError: (error: Error) => {
      toast({
        title: "Eroare la ștergerea comenzii",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    deleteComanda: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error
  };
}
