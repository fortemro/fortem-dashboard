
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardProductieRow {
  id: string;
  nume: string;
  stoc_disponibil: number;
  necesar_comenzi: number;
}

type ItemComandaWithStatus = {
  produs_id: string;
  cantitate: number | null;
  comanda: {
    status: string | null;
  } | null;
};

async function fetchDashboardProduse(): Promise<DashboardProductieRow[]> {
  // 1. Obține toate produsele
  const { data: produseData, error: produseError } = await supabase
    .from("produse")
    .select("id, nume, stoc_disponibil")
    .order("nume", { ascending: true });

  if (produseError) throw new Error(produseError.message);

  // 2. Query explicit cu hint la relația
  const { data: necesare, error: necesarError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda:comanda_id(status)");

  if (necesarError) throw new Error(necesarError.message);

  // Defensive: sum only for well-formed items
  const necesarMap: Record<string, number> = {};
  if (Array.isArray(necesare)) {
    for (const item of necesare) {
      // Check shape: produs_id (string), comanda (object), comanda.status (string|null)
      const produsId = typeof item?.produs_id === "string" ? item.produs_id : null;
      const cantitate = typeof item?.cantitate === "number" ? item.cantitate : 0;
      const status = item?.comanda && typeof item.comanda === "object" ? item.comanda.status : undefined;

      if (
        produsId &&
        (status === "in_asteptare" || status === "in_procesare")
      ) {
        if (!necesarMap[produsId]) necesarMap[produsId] = 0;
        necesarMap[produsId] += cantitate ?? 0;
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
  }));
}

export function useDashboardProductie() {
  return useQuery<DashboardProductieRow[]>({
    queryKey: ["dashboard_productie"],
    queryFn: fetchDashboardProduse,
  });
}
