
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardProductieRow {
  id: string;
  nume: string;
  stoc_disponibil: number;
  necesar_comenzi: number;
}

// Definim tipul pentru rezultatul din itemi_comanda
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

  // 2. Query explicit cu hint la relația corectă pentru a evita ambiguitatea
  //    Acum comanda!comanda_id(status) va returna statusul corect
  const { data: necesare, error: necesarError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda:comanda_id(status)");

  if (necesarError) throw new Error(necesarError.message);

  // Castăm la tipul corect
  const necesarList = (necesare ?? []) as ItemComandaWithStatus[];

  const necesarMap: Record<string, number> = {};
  for (const item of necesarList) {
    // status potențial: 'in_asteptare', 'in_procesare', fără diacritice!
    if (
      item.comanda?.status === "in_asteptare" ||
      item.comanda?.status === "in_procesare"
    ) {
      const pid = item.produs_id;
      if (!necesarMap[pid]) necesarMap[pid] = 0;
      necesarMap[pid] += item.cantitate ?? 0;
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
