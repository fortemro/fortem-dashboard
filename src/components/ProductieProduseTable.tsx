
import { useState } from "react";
import { useProduse } from "@/hooks/useProduse";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Factory } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function ProductieProduseTable() {
  const { produse, loading } = useProduse();
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);

  const handleInputChange = (id: string, value: string) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleAddQuantity = async (produsId: string, currentStoc: number = 0) => {
    const addValue = amounts[produsId];
    if (!addValue || addValue <= 0) {
      toast({
        title: "Introduceți o cantitate validă!",
        description: "Vă rugăm să introduceți o cantitate mai mare decât 0.",
        variant: "destructive",
      });
      return;
    }
    setLoadingIds((prev) => [...prev, produsId]);
    // Update stoc in supabase
    const { error } = await supabase
      .from("produse")
      .update({ stoc_disponibil: (currentStoc || 0) + addValue })
      .eq("id", produsId);

    if (error) {
      toast({
        title: "Eroare la actualizare stoc",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Stoc actualizat cu succes!",
        description: `Au fost adăugate ${addValue} unități.`,
        variant: "default",
      });
    }
    setAmounts((prev) => ({
      ...prev,
      [produsId]: 0,
    }));
    setLoadingIds((prev) => prev.filter((id) => id !== produsId));
  };

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
            <TableHead className="min-w-[180px] text-center">
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
                <form
                  className="flex items-center gap-2 justify-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddQuantity(produs.id, produs.stoc_disponibil || 0);
                  }}
                >
                  <Input
                    type="number"
                    className="w-20"
                    min={1}
                    value={amounts[produs.id] ?? 0}
                    onChange={(e) =>
                      handleInputChange(produs.id, e.target.value)
                    }
                  />
                  <Button
                    type="submit"
                    size="sm"
                    disabled={loadingIds.includes(produs.id)}
                  >
                    {loadingIds.includes(produs.id) ? "Se salvează..." : "Adaugă"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

