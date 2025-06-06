
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProduse } from '@/hooks/useProduse';
import { Package, Euro } from 'lucide-react';

interface ProduseGridProps {
  distributorId?: string;
}

export function ProduseGrid({ distributorId }: ProduseGridProps) {
  const { produse, loading } = useProduse(distributorId);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (produse.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nu sunt produse disponibile</h3>
          <p className="text-gray-500">
            {distributorId 
              ? 'Acest distribuitor nu are produse disponibile momentan.' 
              : 'Nu sunt produse disponibile momentan.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {produse.map((produs) => (
        <Card key={produs.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg">{produs.nume}</CardTitle>
              <Badge variant="secondary">{produs.categorie}</Badge>
            </div>
            {produs.cod_produs && (
              <CardDescription>Cod: {produs.cod_produs}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {produs.descriere && (
              <p className="text-sm text-gray-600 mb-4">{produs.descriere}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg flex items-center">
                  <Euro className="h-4 w-4 mr-1" />
                  {produs.pret} {produs.moneda}
                </span>
                <span className="text-sm text-gray-500">
                  /{produs.unitate_masura}
                </span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Stoc:</span>
                <span className={produs.stoc_disponibil && produs.stoc_disponibil > 0 ? 'text-green-600' : 'text-red-600'}>
                  {produs.stoc_disponibil || 0} {produs.unitate_masura}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
