
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produs } from "@/data-types";

async function fetchProduse(): Promise<Produs[]> {
  const { data, error } = await supabase
    .from('produse')
    .select('*')
    .order('nume', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }
  return data || [];
}

export function useProduse() {
  const { data: produse = [], isLoading, isError, refetch } = useQuery<Produs[]>({
    queryKey: ['produse'],
    queryFn: fetchProduse,
  });

  return { produse, loading: isLoading, error: isError, refetch };
}
