
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

  // Fetch items and commands separately to avoid relationship ambiguity
  const { data: itemsData, error: itemsError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda_id");

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  // Fetch commands data separately
  const comandaIds = Array.from(new Set(itemsData?.map(item => item.comanda_id).filter(Boolean) || []));
  
  let comenziData: any[] = [];
  if (comandaIds.length > 0) {
    const { data: comenziResult, error: comenziError } = await supabase
      .from("comenzi")
      .select("id, status")
      .in("id", comandaIds);

    if (comenziError) {
      throw new Error(comenziError.message);
    }
    comenziData = comenziResult || [];
  }

  // Create a map of comanda_id to status
  const comenziMap: Record<string, string> = {};
  comenziData.forEach(comanda => {
    comenziMap[comanda.id] = comanda.status;
  });

  // Calculate allocated stock per product
  const stocAlocatMap: Record<string, number> = {};
  if (Array.isArray(itemsData)) {
    for (const item of itemsData) {
      const produsId = typeof item?.produs_id === "string" ? item.produs_id : null;
      const cantitate = typeof item?.cantitate === "number" ? item.cantitate : 0;
      const comandaId = typeof item?.comanda_id === "string" ? item.comanda_id : null;

      if (produsId && comandaId) {
        const status = comenziMap[comandaId];
        
        if (status === "in_asteptare" || status === "in_procesare" || status === "in_tranzit") {
          if (!stocAlocatMap[produsId]) stocAlocatMap[produsId] = 0;
          stocAlocatMap[produsId] += cantitate;
        }
      }
    }
  }

  // Combine product data with calculated stock values
  const produseWithCalculatedStock = (produseData || []).map((produs) => {
    const stocFizic = typeof produs.stoc_disponibil === "number" ? produs.stoc_disponibil : 0;
    const stocAlocat = stocAlocatMap[produs.id] ?? 0;
    const stocRealDisponibil = stocFizic - stocAlocat;

    return {
      ...produs,
      stoc_fizic: stocFizic,
      stoc_alocat: stocAlocat,
      stoc_disponibil: stocRealDisponibil
    };
  });

  return produseWithCalculatedStock;
}

export function useProduse() {
  const { data: produse = [], isLoading, isError, refetch } = useQuery<Produs[]>({
    queryKey: ['produse'],
    queryFn: fetchProduse,
  });

  return { produse, loading: isLoading, error: isError, refetch };
}
