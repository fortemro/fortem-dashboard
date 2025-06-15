
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package, TrendingDown } from "lucide-react";
import { useStockAlerts } from "@/hooks/dashboard-executiv/useStockAlerts";

export function AlertsSection() {
  const { alerts, criticalAlerts, warningAlerts, totalAlerts, isLoading } = useStockAlerts();

  if (isLoading) {
    return (
      <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow animate-pulse">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-orange-800 flex items-center text-lg sm:text-xl">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Încărcare alerte...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-orange-200 rounded w-3/4"></div>
            <div className="h-4 bg-orange-200 rounded w-1/2"></div>
            <div className="h-4 bg-orange-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (totalAlerts === 0) {
    return (
      <Card className="border-green-200 bg-green-50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-green-800 flex items-center text-lg sm:text-xl">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Stocuri în Regulă
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-green-700">
            <p className="text-sm sm:text-base">✅ Toate produsele au stocul peste pragul de alertă</p>
            <p className="text-sm sm:text-base">✅ Nu există probleme critice de stoc</p>
            <p className="text-sm sm:text-base">✅ Sistemul de aprovizionare funcționează optim</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-red-800 flex items-center text-lg sm:text-xl">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Atenție Necesară - {totalAlerts} Probleme Detectate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{criticalAlerts}</div>
              <div className="text-sm text-red-600">Stoc Zero</div>
            </div>
            <div className="text-center p-4 bg-orange-100 rounded-lg">
              <div className="text-2xl font-bold text-orange-700">{warningAlerts}</div>
              <div className="text-sm text-orange-600">Stoc Critic</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{totalAlerts - criticalAlerts - warningAlerts}</div>
              <div className="text-sm text-yellow-600">Stoc Scăzut</div>
            </div>
          </div>

          {criticalAlerts > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>ATENȚIE:</strong> {criticalAlerts} produse au stocul ZERO și nu pot fi livrate!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-red-700">
            <p className="text-sm sm:text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {totalAlerts} produse necesită atenție imediată
            </p>
            <p className="text-sm sm:text-base">• Verificați planul de aprovizionare</p>
            <p className="text-sm sm:text-base">• Contactați furnizorii pentru produsele critice</p>
            <p className="text-sm sm:text-base">• Monitorizați comenzile în așteptare</p>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detalii Alerte Stoc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.slice(0, 10).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex justify-between items-center p-2 rounded border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'border-l-red-500 bg-red-50' 
                      : alert.severity === 'warning'
                      ? 'border-l-orange-500 bg-orange-50'
                      : 'border-l-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{alert.nume}</div>
                    <div className="text-xs text-gray-600">{alert.categorie}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-sm ${
                      alert.severity === 'critical' ? 'text-red-700' : 
                      alert.severity === 'warning' ? 'text-orange-700' : 'text-yellow-700'
                    }`}>
                      {alert.stoc_disponibil} / {alert.prag_alerta_stoc}
                    </div>
                    <div className="text-xs text-gray-600">stoc / prag</div>
                  </div>
                </div>
              ))}
              {alerts.length > 10 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  ... și încă {alerts.length - 10} produse
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
