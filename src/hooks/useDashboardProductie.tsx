
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardProductieRow {
  id: string;
  nume: string;
  stoc_disponibil: number;
  necesar_comenzi: number;
  prag_alerta_stoc: number;
}

async function fetchDashboardProduse(): Promise<DashboardProductieRow[]> {
  // 1. Obține toate produsele
  const { data: produseData, error: produseError } = await supabase
    .from("produse")
    .select("id, nume, stoc_disponibil, prag_alerta_stoc")
    .order("nume", { ascending: true });

  if (produseError) throw new Error(produseError.message);

  // 2. Fetch items and commands separately to avoid relationship ambiguity
  const { data: itemsData, error: itemsError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda_id");

  if (itemsError) throw new Error(itemsError.message);

  // 3. Fetch commands data separately
  const comandaIds = Array.from(new Set(itemsData?.map(item => item.comanda_id).filter(Boolean) || []));
  
  let comenziData: any[] = [];
  if (comandaIds.length > 0) {
    const { data: comenziResult, error: comenziError } = await supabase
      .from("comenzi")
      .select("id, status")
      .in("id", comandaIds);

    if (comenziError) throw new Error(comenziError.message);
    comenziData = comenziResult || [];
  }

  // 4. Create a map of comanda_id to status
  const comenziMap: Record<string, string> = {};
  comenziData.forEach(comanda => {
    comenziMap[comanda.id] = comanda.status;
  });

  // 5. Calculate necessary quantities per product
  const necesarMap: Record<string, number> = {};
  if (Array.isArray(itemsData)) {
    for (const item of itemsData) {
      const produsId = typeof item?.produs_id === "string" ? item.produs_id : null;
      const cantitate = typeof item?.cantitate === "number" ? item.cantitate : 0;
      const comandaId = typeof item?.comanda_id === "string" ? item.comanda_id : null;

      if (produsId && comandaId) {
        const status = comenziMap[comandaId];
        
        if (status === "in_asteptare" || status === "in_procesare") {
          if (!necesarMap[produsId]) necesarMap[produsId] = 0;
          necesarMap[produsId] += cantitate;
        }
      }
    }
  }

  return (produseData ?? []).map((produs) => ({
    id: produs.id,
    nume: produs.nume,
    stoc_disponibil:
      typeof produs.stoc_disponibil === "number"
        ? produs.stoc_disponibil
        : 0,
    necesar_comenzi: necesarMap[produs.id] ?? 0,
    prag_alerta_stoc:
      typeof produs.prag_alerta_stoc === "number"
        ? produs.prag_alerta_stoc
        : 0,
  }));
}

export function useDashboardProductie() {
  return useQuery<DashboardProductieRow[]>({
    queryKey: ["dashboard_productie"],
    queryFn: fetchDashboardProduse,
  });
}
