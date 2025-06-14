
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface PerformanceChartsProps {
  periodDisplay: string;
}

export function PerformanceCharts({ periodDisplay }: PerformanceChartsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Performanță Vânzări
        </CardTitle>
        <CardDescription>Evoluția vânzărilor pentru perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center text-gray-500">
            <BarChart3 className="h-12 w-12 mx-auto mb-2" />
            <p>Grafic vânzări pentru {periodDisplay}</p>
            <p className="text-sm">în dezvoltare</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
