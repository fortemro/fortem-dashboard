
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useProduse } from '@/hooks/useProduse';
import { Package, Ruler, Weight, Truck, Warehouse } from 'lucide-react';
import { ProductCartButton } from './ProductCartButton';

export function ProduseGrid() {
  const { produse, loading } = useProduse();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6">
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
        <CardContent className="p-6 sm:p-8 text-center">
          <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Nu sunt produse disponibile</h3>
          <p className="text-sm sm:text-base text-gray-500">
            Nu sunt produse disponibile momentan.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStockColor = (stocReal: number, pragAlerta: number) => {
    if (stocReal <= 0) return "text-red-600 font-bold";
    if (stocReal <= pragAlerta) return "text-orange-600 font-semibold";
    return "text-green-700 font-semibold";
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {produse.map((produs) => (
        <Card key={produs.id} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
              <CardTitle className="text-base sm:text-lg leading-tight">{produs.nume}</CardTitle>
              <div className="flex flex-row sm:flex-col gap-1">
                <Badge variant="secondary" className="text-xs">{produs.categorie}</Badge>
                {produs.tip_produs && (
                  <Badge variant="outline" className="text-xs">{produs.tip_produs}</Badge>
                )}
              </div>
            </div>
            {produs.cod_produs && (
              <CardDescription className="text-xs sm:text-sm">Cod: {produs.cod_produs}</CardDescription>
            )}
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            {produs.descriere && (
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 line-clamp-3">{produs.descriere}</p>
            )}
            
            {/* Secțiunea nouă pentru stocul real */}
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
              <div className="flex items-center mb-2">
                <Warehouse className="h-4 w-4 mr-2 text-blue-600" />
                <h4 className="text-sm font-semibold text-gray-800">Stoc Disponibil</h4>
              </div>
              <div className="text-center">
                <div className={`text-2xl ${getStockColor(produs.stoc_disponibil || 0, produs.prag_alerta_stoc || 10)}`}>
                  {produs.stoc_disponibil || 0}
                </div>
                <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                  <div>Fizic în depozit: {(produs as any).stoc_fizic || 0}</div>
                  <div>Alocat comenzilor: {(produs as any).stoc_alocat || 0}</div>
                </div>
              </div>
            </div>
            
            {/* Informații dimensiuni și greutate */}
            {(produs.dimensiuni || produs.kg_per_buc || produs.densitate) && (
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-50 rounded-lg">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center">
                  <Ruler className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Specificații Tehnice
                </h4>
                <div className="space-y-1 text-xs">
                  {produs.dimensiuni && (
                    <div className="flex justify-between items-start">
                      <span className="flex-shrink-0 mr-2">Dimensiuni:</span>
                      <span className="font-medium text-right break-all">{produs.dimensiuni}</span>
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
              <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-blue-50 rounded-lg">
                <h4 className="text-xs sm:text-sm font-semibold mb-2 flex items-center">
                  <Truck className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
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
            
            <ProductCartButton produs={produs} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
