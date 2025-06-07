
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProduse } from '@/hooks/useProduse';
import { Package, Ruler, Weight, Truck } from 'lucide-react';
import { ProductCartButton } from './ProductCartButton';

export function ProduseGrid() {
  const { produse, loading } = useProduse();

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
            Nu sunt produse disponibile momentan.
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
              <div className="flex flex-col gap-1">
                <Badge variant="secondary">{produs.categorie}</Badge>
                {produs.tip_produs && (
                  <Badge variant="outline" className="text-xs">{produs.tip_produs}</Badge>
                )}
              </div>
            </div>
            {produs.cod_produs && (
              <CardDescription>Cod: {produs.cod_produs}</CardDescription>
            )}
          </CardHeader>
          <CardContent>
            {produs.descriere && (
              <p className="text-sm text-gray-600 mb-4">{produs.descriere}</p>
            )}
            
            {/* Informații dimensiuni și greutate */}
            {(produs.dimensiuni || produs.kg_per_buc || produs.densitate) && (
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Ruler className="h-4 w-4 mr-1" />
                  Specificații Tehnice
                </h4>
                <div className="space-y-1 text-xs">
                  {produs.dimensiuni && (
                    <div className="flex justify-between">
                      <span>Dimensiuni:</span>
                      <span className="font-medium">{produs.dimensiuni}</span>
                    </div>
                  )}
                  {produs.kg_per_buc && (
                    <div className="flex justify-between">
                      <span>Greutate/buc:</span>
                      <span className="font-medium">{produs.kg_per_buc} kg</span>
                    </div>
                  )}
                  {produs.densitate && (
                    <div className="flex justify-between">
                      <span>Densitate:</span>
                      <span className="font-medium">{produs.densitate}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Informații paletizare */}
            {(produs.bucati_per_palet || produs.paleti_per_camion || produs.bucati_per_legatura) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold mb-2 flex items-center">
                  <Truck className="h-4 w-4 mr-1" />
                  Informații Paletizare
                </h4>
                <div className="space-y-1 text-xs">
                  {produs.bucati_per_palet && (
                    <div className="flex justify-between">
                      <span>Bucăți/palet:</span>
                      <span className="font-medium">{produs.bucati_per_palet}</span>
                    </div>
                  )}
                  {produs.bucati_per_legatura && (
                    <div className="flex justify-between">
                      <span>Bucăți/legătură:</span>
                      <span className="font-medium">{produs.bucati_per_legatura}</span>
                    </div>
                  )}
                  {produs.paleti_per_camion && (
                    <div className="flex justify-between">
                      <span>Paleți/camion:</span>
                      <span className="font-medium">{produs.paleti_per_camion}</span>
                    </div>
                  )}
                  {produs.kg_per_camion && (
                    <div className="flex justify-between">
                      <span>Kg/camion:</span>
                      <span className="font-medium">{produs.kg_per_camion} kg</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Product cart button - replaces price and stock section */}
            <ProductCartButton produs={produs} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
