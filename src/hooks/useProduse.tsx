
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Produs } from "@/data-types";

async function fetchProduse(): Promise<Produs[]> {
  console.log('[useProduse] Starting fetchProduse...');
  
  // Fetch basic product data - NU mai suprascriem stoc_disponibil
  const { data: produseData, error: produseError } = await supabase
    .from('produse')
    .select('*')
    .order('nume', { ascending: true });

  if (produseError) {
    console.error('[useProduse] Error fetching produse:', produseError);
    throw new Error(produseError.message);
  }

  console.log('[useProduse] Fetched produse:', produseData?.length || 0);

  // Folosim funcția PostgreSQL reparată pentru stocurile reale
  const { data: stocuriReale, error: stocuriError } = await supabase
    .rpc('get_stocuri_reale_pentru_produse');

  if (stocuriError) {
    console.error('[useProduse] Error fetching real stock:', stocuriError);
    // Nu aruncăm eroare - continuăm cu stocurile fizice
  }

  console.log('[useProduse] Real stock data:', stocuriReale?.length || 0);

  // Create a map of product ID to real stock for efficient lookup
  const stocuriRealeMap = new Map(
    stocuriReale?.map(item => [item.produs_id, item.stoc_real]) || []
  );

  // Calculăm separat stocul alocat pentru transparency
  const { data: itemsData, error: itemsError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda_id");

  if (itemsError) {
    console.error('[useProduse] Error fetching items:', itemsError);
  }

  // Fetch commands data separately pentru comenzile active
  const comandaIds = Array.from(new Set(itemsData?.map(item => item.comanda_id).filter(Boolean) || []));
  
  let comenziData: any[] = [];
  if (comandaIds.length > 0) {
    const { data: comenziResult, error: comenziError } = await supabase
      .from("comenzi")
      .select("id, status")
      .in("id", comandaIds);

    if (comenziError) {
      console.error('[useProduse] Error fetching comenzi:', comenziError);
    }
    comenziData = comenziResult || [];
  }

  // Create a map of comanda_id to status
  const comenziMap: Record<string, string> = {};
  comenziData.forEach(comanda => {
    comenziMap[comanda.id] = comanda.status;
  });

  // Calculate allocated stock per product - pentru transparență
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

  // Combine product data with SEPARATED stock values - NU suprascriem stoc_disponibil
  const produseWithCalculatedStock = (produseData || []).map((produs) => {
    const stocFizic = typeof produs.stoc_disponibil === "number" ? produs.stoc_disponibil : 0;
    const stocAlocat = stocAlocatMap[produs.id] ?? 0;
    const stocRealCalculat = stocuriRealeMap.get(produs.id) ?? (stocFizic - stocAlocat);

    console.log(`[useProduse] Product ${produs.nume}: fizic=${stocFizic}, alocat=${stocAlocat}, real=${stocRealCalculat}`);

    return {
      ...produs,
      // PĂSTRĂM stoc_disponibil original - acesta e stocul fizic din baza de date
      stoc_fizic: stocFizic,              // Explicit pentru claritate
      stoc_alocat: stocAlocat,            // Calculat din comenzi active
      stoc_real_disponibil: stocRealCalculat  // Calculat: fizic - alocat
    };
  });

  console.log('[useProduse] Final processed products:', produseWithCalculatedStock.length);
  return produseWithCalculatedStock;
}

export function useProduse() {
  const { data: produse = [], isLoading, isError, refetch } = useQuery<Produs[]>({
    queryKey: ['produse'],
    queryFn: fetchProduse,
    staleTime: 30 * 1000, // 30 seconds - reduce frequent refetches
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
  });

  console.log('[useProduse] Hook result - products:', produse.length, 'loading:', isLoading, 'error:', isError);

  return { produse, loading: isLoading, error: isError, refetch };
}
