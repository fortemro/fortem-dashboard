
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AlertsSectionProps {
  alerteStoc: number;
}

export function AlertsSection({ alerteStoc }: AlertsSectionProps) {
  return (
    <Card className="border-orange-200 bg-orange-50 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-orange-800 flex items-center text-lg sm:text-xl">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Atenție Necesară
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-orange-700">
          <p className="text-sm sm:text-base break-words">• {alerteStoc} produse au stocul sub pragul de alertă</p>
          <p className="text-sm sm:text-base break-words">• 3 distribuitori nu au plasat comenzi în perioada selectată</p>
          <p className="text-sm sm:text-base break-words">• 2 comenzi sunt în întârziere la livrare</p>
        </div>
      </CardContent>
    </Card>
  );
}
