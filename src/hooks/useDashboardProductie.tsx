
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardProductieRow {
  id: string;
  nume: string;
  stoc_disponibil: number;
  necesar_comenzi: number;
}

async function fetchDashboardProduse(): Promise<DashboardProductieRow[]> {
  // 1. Obține toate produsele
  const { data: produseData, error: produseError } = await supabase
    .from("produse")
    .select("id, nume, stoc_disponibil")
    .order("nume", { ascending: true });

  if (produseError) throw new Error(produseError.message);

  // 2. Pentru comenzile "în așteptare" sau "în procesare", agregăm cantitatea de produs
  // Query toate itemi_comanda cu join la comanda pentru filtrare status și grupăm pe produs_id
  const { data: necesare, error: necesarError } = await supabase
    .from("itemi_comanda")
    .select("produs_id, cantitate, comanda:comanda_id(status)")
    // statusul comenzii e în ['in_asteptare', 'in_procesare']  
    // (DB: status default = 'in_asteptare', 'in procesare' ar trebui să fie exact în această formă, verificați dacă forma statusurilor e corectă)
  
  if (necesarError) throw new Error(necesarError.message);

  const necesarMap: Record<string, number> = {};
  for (const item of necesare ?? []) {
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
