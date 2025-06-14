
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUpdateStoc() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ produsId, nouStoc }: { produsId: string, nouStoc: number }) => {
      const { error } = await supabase
        .from("produse")
        .update({ stoc_disponibil: nouStoc })
        .eq("id", produsId);

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      // Revalidare lista produse la succes
      queryClient.invalidateQueries({ queryKey: ['produse'] });
    }
  });

  return mutation;
}
