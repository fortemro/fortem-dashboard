
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

  return (
    <div>
      <AlerteStocCritic produse={data} />
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px]">Nume Produs</TableHead>
              <TableHead className="text-center">Stoc Disponibil</TableHead>
              <TableHead className="text-center">Necesar Comenzi</TableHead>
              <TableHead className="text-center">Balanță</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => {
              const balanta = row.stoc_disponibil - row.necesar_comenzi;
              const isStocCritic = row.stoc_disponibil <= row.prag_alerta_stoc;
              
              return (
                <TableRow key={row.id} className={isStocCritic ? "bg-red-50" : ""}>
                  <TableCell className={isStocCritic ? "text-red-900 font-medium" : ""}>
                    {row.nume}
                    {isStocCritic && (
                      <span className="ml-2 text-red-600 text-xs">⚠️</span>
                    )}
                  </TableCell>
                  <TableCell className={`text-center ${isStocCritic ? "text-red-700 font-bold" : ""}`}>
                    {row.stoc_disponibil}
                  </TableCell>
                  <TableCell className="text-center">{row.necesar_comenzi}</TableCell>
                  <TableCell className="text-center">
                    <span
                      className={
                        balanta < 0
                          ? "font-bold text-red-600"
                          : "font-semibold text-green-700"
                      }
                    >
                      {balanta}
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
