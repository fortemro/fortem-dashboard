
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface PerformanceChartsProps {
  periodDisplay: string;
}

export function PerformanceCharts({ periodDisplay }: PerformanceChartsProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center text-lg sm:text-xl">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Performanță Vânzări
        </CardTitle>
        <CardDescription className="text-sm">Evoluția vânzărilor pentru perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-48 sm:h-64 flex items-center justify-center bg-gray-50 rounded">
          <div className="text-center text-gray-500 p-4">
            <BarChart3 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2" />
            <p className="text-sm sm:text-base break-words">Grafic vânzări pentru {periodDisplay}</p>
            <p className="text-xs sm:text-sm">în dezvoltare</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
