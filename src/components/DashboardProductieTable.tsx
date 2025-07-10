
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useDashboardProductie } from "@/hooks/useDashboardProductie";
import { AlerteStocCritic } from "@/components/AlerteStocCritic";

export function DashboardProductieTable() {
  const { data, isLoading, error } = useDashboardProductie();

  if (isLoading) {
    return (
      <div className="py-10 text-center text-gray-500">Se încarcă datele…</div>
    );
  }
  if (error) {
    return (
      <div className="py-10 text-center text-red-500">
        Eroare la încărcarea datelor: {error.message}
      </div>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="py-10 text-center text-gray-400">
        Nu sunt produse în sistem.
      </div>
    );
  }

  // Convert data for AlerteStocCritic component (maintain compatibility)
  const produseForAlerts = data.map(row => ({
    ...row,
    stoc_disponibil: row.stoc_real_disponibil,
    necesar_comenzi: row.stoc_alocat
  }));

  return (
    <div>
      <AlerteStocCritic produse={produseForAlerts} />
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Nume Produs</TableHead>
              <TableHead className="text-center">Stoc Scriptic</TableHead>
              <TableHead className="text-center">Stoc Alocat Comenzilor</TableHead>
              <TableHead className="text-center">Stoc Real Disponibil pt. Vânzare</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const isStocCritic = row.stoc_real_disponibil <= row.prag_alerta_stoc;
              
              return (
                <TableRow key={row.id} className={isStocCritic ? "bg-red-50" : ""}>
                  <TableCell className={isStocCritic ? "text-red-900 font-medium" : ""}>
                    {row.nume}
                    {isStocCritic && (
                      <span className="ml-2 text-red-600 text-xs">⚠️</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-blue-700">
                      {row.stoc_fizic}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="font-medium text-orange-600">
                      {row.stoc_alocat}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        row.stoc_real_disponibil <= 0
                          ? "font-bold text-red-600"
                          : isStocCritic
                          ? "font-bold text-orange-600"
                          : "font-semibold text-green-700"
                      }
                    >
                      {row.stoc_real_disponibil}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
