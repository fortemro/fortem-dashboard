
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

export function AdminValidationCard() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Validare Prețuri
        </CardTitle>
        <CardDescription>
          Verificați consistența prețurilor cu grilele oficiale
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link to="/admin/validare-preturi">
          <Button>
            Accesează Validarea Prețurilor
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
