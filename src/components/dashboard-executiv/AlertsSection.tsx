
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Package, TrendingDown, RefreshCw, Clock } from "lucide-react";
import { useStockAlerts } from "@/hooks/dashboard-executiv/useStockAlerts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function AlertsSection() {
  const { alerts, criticalAlerts, warningAlerts, lowStockAlerts, totalAlerts, isLoading, refetch } = useStockAlerts();

  const handleRefresh = () => {
    refetch();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'warning': return 'bg-orange-500 text-white';
      case 'low': return 'bg-yellow-500 text-black';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'CRITIC';
      case 'warning': return 'ATENȚIE';
      case 'low': return 'SCĂZUT';
      default: return 'NECUNOSCUT';
    }
  };

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
        <CardHeader className="pb-3 sm:pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-green-800 flex items-center text-lg sm:text-xl">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Stocuri în Regulă
          </CardTitle>
          <Button 
            onClick={handleRefresh} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizează
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-green-700">
            <p className="text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Toate produsele au stocul peste pragul de alertă
            </p>
            <p className="text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Nu există probleme critice de stoc
            </p>
            <p className="text-sm sm:text-base flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Sistemul de aprovizionare funcționează optim
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="border-red-200 bg-red-50 hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4 flex flex-row items-center justify-between">
          <CardTitle className="text-red-800 flex items-center text-lg sm:text-xl">
            <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Atenție Necesară - {totalAlerts} Probleme Detectate
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              Auto-refresh: 5min
            </div>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Actualizează
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-red-100 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{criticalAlerts}</div>
              <div className="text-sm text-red-600 font-medium">Stoc Zero (CRITIC)</div>
            </div>
            <div className="text-center p-4 bg-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-700">{warningAlerts}</div>
              <div className="text-sm text-orange-600 font-medium">Stoc Foarte Scăzut</div>
            </div>
            <div className="text-center p-4 bg-yellow-100 rounded-lg border border-yellow-200">
              <div className="text-2xl font-bold text-yellow-700">{lowStockAlerts}</div>
              <div className="text-sm text-yellow-600 font-medium">Stoc Scăzut</div>
            </div>
          </div>

          {criticalAlerts > 0 && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>ATENȚIE URGENTĂ:</strong> {criticalAlerts} produse au stocul ZERO și nu pot fi livrate!
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2 text-red-700">
            <p className="text-sm sm:text-base flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              {totalAlerts} produse necesită atenție imediată
            </p>
            <ul className="text-sm sm:text-base space-y-1 ml-6">
              <li>• Verificați planul de aprovizionare</li>
              <li>• Contactați furnizorii pentru produsele critice</li>
              <li>• Monitorizați comenzile în așteptare</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>Detalii Alerte Stoc</span>
              <Badge variant="outline">{alerts.length} alerte</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {alerts.slice(0, 15).map((alert) => (
                <div 
                  key={alert.id} 
                  className={`flex justify-between items-center p-3 rounded border-l-4 ${
                    alert.severity === 'critical' 
                      ? 'border-l-red-500 bg-red-50' 
                      : alert.severity === 'warning'
                      ? 'border-l-orange-500 bg-orange-50'
                      : 'border-l-yellow-500 bg-yellow-50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="font-medium text-sm truncate">{alert.nume}</div>
                      <Badge 
                        className={`text-xs ${getSeverityColor(alert.severity)}`}
                      >
                        {getSeverityText(alert.severity)}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600">{alert.categorie}</div>
                    {alert.stoc_disponibil > 0 && (
                      <div className="text-xs text-gray-500">
                        {alert.percentage}% din pragul minim
                      </div>
                    )}
                  </div>
                  <div className="text-right ml-4">
                    <div className={`font-bold text-sm ${
                      alert.severity === 'critical' ? 'text-red-700' : 
                      alert.severity === 'warning' ? 'text-orange-700' : 'text-yellow-700'
                    }`}>
                      {alert.stoc_disponibil} / {alert.prag_alerta_stoc}
                    </div>
                    <div className="text-xs text-gray-600">stoc / prag</div>
                    {alert.stoc_disponibil === 0 && (
                      <div className="text-xs font-bold text-red-600 mt-1">
                        EPUIZAT
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {alerts.length > 15 && (
                <div className="text-center py-3 text-sm text-gray-500 border-t">
                  ... și încă {alerts.length - 15} produse cu probleme de stoc
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
