
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { usePerformanceMonitoring } from "@/hooks/dashboard-executiv/usePerformanceMonitoring";
import { Activity, Zap, Network, HardDrive, TrendingUp, AlertTriangle, Info } from "lucide-react";

export function PerformanceInsights() {
  const { metrics, componentTimings, getPerformanceInsights } = usePerformanceMonitoring();
  const insights = getPerformanceInsights();

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info': return <Info className="h-4 w-4 text-blue-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'error': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-orange-200 bg-orange-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Metrici Performance în Timp Real */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Metrici Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Render Time
                </span>
                <Badge variant={metrics.renderTime > 100 ? "destructive" : "secondary"}>
                  {metrics.renderTime.toFixed(1)}ms
                </Badge>
              </div>
              <Progress 
                value={Math.min((metrics.renderTime / 200) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <HardDrive className="h-3 w-3" />
                  Memorie
                </span>
                <Badge variant={metrics.memoryUsage > 50 ? "destructive" : "secondary"}>
                  {metrics.memoryUsage.toFixed(1)}MB
                </Badge>
              </div>
              <Progress 
                value={Math.min((metrics.memoryUsage / 100) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Network className="h-3 w-3" />
                  Latență Rețea
                </span>
                <Badge variant={metrics.networkLatency > 1000 ? "destructive" : "secondary"}>
                  {metrics.networkLatency.toFixed(0)}ms
                </Badge>
              </div>
              <Progress 
                value={Math.min((metrics.networkLatency / 2000) * 100, 100)} 
                className="h-2"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Cache Hit Rate
                </span>
                <Badge variant={metrics.cacheHitRate > 70 ? "secondary" : "destructive"}>
                  {metrics.cacheHitRate.toFixed(1)}%
                </Badge>
              </div>
              <Progress 
                value={metrics.cacheHitRate} 
                className="h-2"
              />
            </div>
          </div>

          {Object.keys(metrics.apiResponseTimes).length > 0 && (
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">API Response Times</h4>
              <div className="space-y-1">
                {Object.entries(metrics.apiResponseTimes).map(([api, time]) => (
                  <div key={api} className="flex justify-between text-xs">
                    <span className="text-gray-600">{api}</span>
                    <span className={time > 1000 ? "text-red-600 font-medium" : "text-gray-800"}>
                      {time.toFixed(0)}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights și Recomandări */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Insights și Recomandări
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-green-700 font-medium">Performance Excelentă!</p>
              <p className="text-sm text-gray-600 mt-1">
                Toate metricile sunt în parametri optimi
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((insight, index) => (
                <div 
                  key={index} 
                  className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
                >
                  <div className="flex items-start gap-3">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {insight.message}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        💡 {insight.recommendation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {Object.keys(componentTimings).length > 0 && (
            <div className="pt-4 border-t mt-4">
              <h4 className="text-sm font-medium mb-2">Component Performance</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {Object.entries(componentTimings).map(([component, timing]) => (
                  <div key={component} className="flex justify-between items-center text-xs">
                    <span className="text-gray-600 truncate">{component}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-gray-500">{timing.renderCount} renders</span>
                      <Badge variant="outline" className="text-xs">
                        {timing.averageRenderTime.toFixed(1)}ms avg
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
