
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

  // 2. Query explicit cu hint la relația corectă pentru a evita ambiguitatea
  const { data: necesare, error: necesarError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda:comanda_id(status)");

  if (necesarError) throw new Error(necesarError.message);

  // Filter only well-formed items (defensive against type errors/Supabase oddities)
  const necesarList: ItemComandaWithStatus[] = Array.isArray(necesare)
    ? necesare.filter(
        (item): item is ItemComandaWithStatus =>
          typeof item === "object" &&
          typeof item.produs_id === "string" &&
          ("cantitate" in item) &&
          item.comanda &&
          typeof item.comanda === "object" &&
          "status" in item.comanda
      )
    : [];

  const necesarMap: Record<string, number> = {};
  for (const item of necesarList) {
    // status din schema: 'in_asteptare', 'in_procesare'
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
