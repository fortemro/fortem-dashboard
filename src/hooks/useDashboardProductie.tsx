
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardProductieRow {
  id: string;
  nume: string;
  stoc_fizic: number;
  stoc_alocat: number;
  stoc_real_disponibil: number;
  prag_alerta_stoc: number;
}

async function fetchDashboardProduse(): Promise<DashboardProductieRow[]> {
  console.log('[useDashboardProductie] Starting fetchDashboardProduse...');
  
  // 1. Obține toate produsele cu stocul scriptic
  const { data: produseData, error: produseError } = await supabase
    .from("produse")
    .select("id, nume, stoc_disponibil, prag_alerta_stoc")
    .order("nume", { ascending: true });

  if (produseError) {
    console.error('[useDashboardProductie] Error fetching produse:', produseError);
    throw new Error(produseError.message);
  }

  console.log('[useDashboardProductie] Fetched produse:', produseData?.length || 0);

  // 2. Folosim funcția PostgreSQL reparată pentru stocurile reale
  const { data: stocuriReale, error: stocuriError } = await supabase
    .rpc('get_stocuri_reale_pentru_produse');

  if (stocuriError) {
    console.error('[useDashboardProductie] Error fetching real stock:', stocuriError);
    // Continuăm cu calcul manual dacă funcția nu merge
  }

  console.log('[useDashboardProductie] Real stock data:', stocuriReale?.length || 0);

  // Create map pentru lookup rapid
  const stocuriRealeMap = new Map(
    stocuriReale?.map(item => [item.produs_id, item.stoc_real]) || []
  );

  // 3. Calculăm manual stocul alocat ca backup
  const { data: itemsData, error: itemsError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda_id");

  if (itemsError) {
    console.error('[useDashboardProductie] Error fetching items:', itemsError);
  }

  // 4. Fetch commands data separately
  const comandaIds = Array.from(new Set(itemsData?.map(item => item.comanda_id).filter(Boolean) || []));
  
  let comenziData: any[] = [];
  if (comandaIds.length > 0) {
    const { data: comenziResult, error: comenziError } = await supabase
      .from("comenzi")
      .select("id, status")
      .in("id", comandaIds);

    if (comenziError) {
      console.error('[useDashboardProductie] Error fetching comenzi:', comenziError);
    }
    comenziData = comenziResult || [];
  }

  // 5. Create a map of comanda_id to status
  const comenziMap: Record<string, string> = {};
  comenziData.forEach(comanda => {
    comenziMap[comanda.id] = comanda.status;
  });

  // 6. Calculate allocated stock per product
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

  const result = (produseData ?? []).map((produs) => {
    const stocScriptic = typeof produs.stoc_disponibil === "number" ? produs.stoc_disponibil : 0;
    const stocAlocat = stocAlocatMap[produs.id] ?? 0;
    
    // Folosim stocul real din funcția PostgreSQL sau calculăm manual
    const stocRealDisponibil = stocuriRealeMap.get(produs.id) ?? (stocScriptic - stocAlocat);

    console.log(`[useDashboardProductie] Product ${produs.nume}: scriptic=${stocScriptic}, alocat=${stocAlocat}, real=${stocRealDisponibil}`);

    return {
      id: produs.id,
      nume: produs.nume,
      stoc_fizic: stocScriptic,
      stoc_alocat: stocAlocat,
      stoc_real_disponibil: stocRealDisponibil,
      prag_alerta_stoc: typeof produs.prag_alerta_stoc === "number" ? produs.prag_alerta_stoc : 0,
    };
  });

  console.log('[useDashboardProductie] Final result:', result.length);
  return result;
}

export function useDashboardProductie() {
  return useQuery<DashboardProductieRow[]>({
    queryKey: ["dashboard_productie"],
    queryFn: fetchDashboardProduse,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
  });
}
