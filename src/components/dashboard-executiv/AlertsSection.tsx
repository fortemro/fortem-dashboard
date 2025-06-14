
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface AlertsSectionProps {
  alerteStoc: number;
}

export function AlertsSection({ alerteStoc }: AlertsSectionProps) {
  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800 flex items-center">
          <AlertTriangle className="h-5 w-5 mr-2" />
          Atenție Necesară
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-orange-700">
          <p>• {alerteStoc} produse au stocul sub pragul de alertă</p>
          <p>• 3 distribuitori nu au plasat comenzi în perioada selectată</p>
          <p>• 2 comenzi sunt în întârziere la livrare</p>
        </div>
      </CardContent>
    </Card>
  );
}
