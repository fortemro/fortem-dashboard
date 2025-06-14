
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { DashboardProductieRow } from "@/hooks/useDashboardProductie";

interface AlerteStocCriticProps {
  produse: DashboardProductieRow[];
}

export function AlerteStocCritic({ produse }: AlerteStocCriticProps) {
  // Filtrează produsele cu stoc critic (stoc real disponibil <= prag alertă)
  const produseStocCritic = produse.filter(
    (produs) => produs.stoc_real_disponibil <= produs.prag_alerta_stoc
  );

  if (produseStocCritic.length === 0) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-green-800 text-lg flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <span className="text-white text-sm">✓</span>
            </div>
            Stoc OK
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-green-700">
            Toate produsele au stocul peste pragul de alertă.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-red-800 text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Alerte Stoc Critic ({produseStocCritic.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {produseStocCritic.map((produs) => (
            <Alert key={produs.id} variant="destructive" className="bg-white">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="text-sm font-semibold">
                {produs.nume}
              </AlertTitle>
              <AlertDescription className="text-xs">
                <div className="flex justify-between items-center mt-1">
                  <span>Stoc: <strong>{produs.stoc_real_disponibil}</strong></span>
                  <span>Prag: <strong>{produs.prag_alerta_stoc}</strong></span>
                </div>
                {produs.stoc_real_disponibil === 0 && (
                  <div className="mt-1 text-red-700 font-medium">
                    ⚠️ STOC EPUIZAT
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
