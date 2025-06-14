
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produs } from "@/data-types";

async function fetchProduse(): Promise<Produs[]> {
  // Fetch basic product data
  const { data: produseData, error: produseError } = await supabase
    .from('produse')
    .select('*')
    .order('nume', { ascending: true });

  if (produseError) {
    throw new Error(produseError.message);
  }

  // Fetch real stock data using the new function
  const { data: stocuriReale, error: stocuriError } = await supabase
    .rpc('get_stocuri_reale_pentru_produse');

  if (stocuriError) {
    throw new Error(stocuriError.message);
  }

  // Create a map of product ID to real stock for efficient lookup
  const stocuriMap = new Map(
    stocuriReale?.map(item => [item.produs_id, item.stoc_real]) || []
  );

  // Combine product data with real stock values
  const produseWithRealStock = produseData?.map(produs => ({
    ...produs,
    stoc_disponibil: stocuriMap.get(produs.id) ?? 0
  })) || [];

  return produseWithRealStock;
}

export function useProduse() {
  const { data: produse = [], isLoading, isError, refetch } = useQuery<Produs[]>({
    queryKey: ['produse'],
    queryFn: fetchProduse,
  });

  return { produse, loading: isLoading, error: isError, refetch };
}
