
import { useProduse } from "@/hooks/useProduse";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Factory } from "lucide-react";

export function ProductieProduseTable() {
  const { produse, loading } = useProduse();

  if (loading) {
    return (
      <div className="py-10 text-center text-gray-500">Se încarcă produse...</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Nume Produs</TableHead>
            <TableHead className="min-w-[100px] text-center">
              Stoc Disponibil
            </TableHead>
            <TableHead className="min-w-[100px] text-center">
              Prag Alertă
            </TableHead>
            <TableHead className="min-w-[120px] text-center">
              Adaugă Producție Nouă
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {produse.map((produs) => (
            <TableRow key={produs.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Factory className="h-4 w-4 text-gray-500" />
                  <span>{produs.nume}</span>
                </div>
              </TableCell>
              <TableCell className="text-center font-semibold">
                {typeof produs.stoc_disponibil === "number"
                  ? produs.stoc_disponibil
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {typeof produs.prag_alerta_stoc === "number"
                  ? produs.prag_alerta_stoc
                  : "-"}
              </TableCell>
              <TableCell className="text-center">
                {/* Butonul/Acțiunea urmează a fi implementată */}
                <button
                  className="bg-primary px-3 py-1 rounded text-white text-xs hover:bg-primary/90 disabled:opacity-60"
                  disabled
                  title="În curând"
                  style={{ cursor: "not-allowed" }}
                >
                  Adaugă
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
