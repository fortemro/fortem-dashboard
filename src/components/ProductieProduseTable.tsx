
import { useState } from "react";
import { useProduse } from "@/hooks/useProduse";
import { useUpdateStoc } from "@/hooks/useUpdateStoc";
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
import { Factory, Check, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function ProductieProduseTable() {
  const { produse, loading, refetch } = useProduse();
  const updateStoc = useUpdateStoc();
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  const [editingPragId, setEditingPragId] = useState<string | null>(null);
  const [pragValues, setPragValues] = useState<Record<string, number>>({});

  // LOG: la fiecare randare, vezi ce produse există după fetch/refetch
  console.log("[ProductieProduseTable] produse din useProduse", produse);

  const handleInputChange = (id: string, value: string) => {
    setAmounts((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  const handleAddQuantity = async (produsId: string, currentStoc: number = 0) => {
    const addValue = amounts[produsId];
    console.log(`[handleAddQuantity] Incearca sa adauge la produs ${produsId}. Valoare introdusa:`, addValue, "Stoc curent:", currentStoc);
    if (!addValue || addValue <= 0) {
      toast({
        title: "Introduceți o cantitate validă!",
        description: "Vă rugăm să introduceți o cantitate mai mare decât 0.",
        variant: "destructive",
      });
      return;
    }
    setLoadingIds((prev) => [...prev, produsId]);
    updateStoc.mutate(
      { produsId, nouStoc: currentStoc + addValue },
      {
        onSuccess: () => {
          console.log(`[handleAddQuantity][onSuccess] Stoc modificat pentru produsul: ${produsId}. Adaugat:`, addValue, "Noul stoc:", currentStoc + addValue);
          toast({
            title: "Stoc actualizat cu succes!",
            description: `Au fost adăugate ${addValue} unități.`,
            variant: "default",
          });
          setAmounts((prev) => ({
            ...prev,
            [produsId]: 0,
          }));
          console.log("[handleAddQuantity][onSuccess] Apelez refetch dupa update stoc.");
          refetch();
        },
        onError: (error: any) => {
          console.error(`[handleAddQuantity][onError] Eroare la update stoc produs ${produsId}:`, error);
          toast({
            title: "Eroare la actualizare stoc",
            description: error.message,
            variant: "destructive",
          });
        },
        onSettled: () => {
          setLoadingIds((prev) => prev.filter((id) => id !== produsId));
          console.log(`[handleAddQuantity][onSettled] loadingIds dupa update:`, loadingIds);
        },
      }
    );
  };

  const handleEditPragClick = (produsId: string, currentValue: number | undefined | null) => {
    setEditingPragId(produsId);
    setPragValues((prev) => ({
      ...prev,
      [produsId]: typeof currentValue === "number" ? currentValue : 0,
    }));
  };

  const handlePragValueChange = (produsId: string, value: string) => {
    setPragValues((prev) => ({
      ...prev,
      [produsId]: Number(value),
    }));
  };

  const handleSavePrag = async (produsId: string) => {
    const newValue = pragValues[produsId];
    console.log(`[handleSavePrag] Incearca sa salveze pragul pentru ${produsId}:`, newValue, typeof newValue);
    setLoadingIds((prev) => [...prev, produsId]);

    const { error } = await supabase
      .from("produse")
      .update({ prag_alerta_stoc: newValue })
      .eq("id", produsId);

    if (error) {
      console.error(`[handleSavePrag][onError] Eroare la update prag_alerta_stoc produs ${produsId}:`, error);
      toast({
        title: "Eroare la actualizare prag alertă",
        description: error.message,
        variant: "destructive",
      });
    } else {
      console.log(`[handleSavePrag][onSuccess] Prag alertă modificat pentru produsul: ${produsId}. Nou prag:`, newValue);
      toast({
        title: "Pragul de alertă a fost actualizat!",
        description: `Noua valoare: ${newValue}`,
        variant: "default",
      });
      // log inainte de refetch
      console.log("[handleSavePrag][onSuccess] Apelez refetch dupa update prag_alerta_stoc.");
      refetch();
    }
    setEditingPragId(null);
    setLoadingIds((prev) => prev.filter((id) => id !== produsId));
  };

  const handleCancelEditPrag = () => {
    setEditingPragId(null);
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
                {editingPragId === produs.id ? (
                  <div className="flex items-center gap-2 justify-center">
                    <Input
                      type="number"
                      min={0}
                      className="w-20"
                      value={pragValues[produs.id] ?? ""}
                      onChange={(e) =>
                        handlePragValueChange(produs.id, e.target.value)
                      }
                      autoFocus
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="p-1"
                      onClick={() => handleSavePrag(produs.id)}
                      disabled={loadingIds.includes(produs.id)}
                      aria-label="Salvează prag alertă"
                    >
                      <Check className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="p-1"
                      onClick={handleCancelEditPrag}
                      aria-label="Anulează editarea"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </Button>
                  </div>
                ) : (
                  <span
                    className="font-semibold cursor-pointer hover:underline"
                    title="Click pentru a edita pragul de alertă"
                    tabIndex={0}
                    onClick={() =>
                      handleEditPragClick(
                        produs.id,
                        typeof produs.prag_alerta_stoc === "number"
                          ? produs.prag_alerta_stoc
                          : 0
                      )
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleEditPragClick(
                          produs.id,
                          typeof produs.prag_alerta_stoc === "number"
                            ? produs.prag_alerta_stoc
                            : 0
                        );
                      }
                    }}
                  >
                    {typeof produs.prag_alerta_stoc === "number"
                      ? produs.prag_alerta_stoc
                      : "-"}
                  </span>
                )}
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
                    disabled={loadingIds.includes(produs.id) || updateStoc.isPending}
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

