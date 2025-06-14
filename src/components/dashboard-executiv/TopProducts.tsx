
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface Product {
  nume: string;
  cantitate: string;
  valoare: string;
  trend: string;
}

interface TopProductsProps {
  products: Product[];
}

export function TopProducts({ products }: TopProductsProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl">Top Produse</CardTitle>
        <CardDescription className="text-sm">Cele mai vândute produse în perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm sm:text-base">Nu există date pentru perioada selectată</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((produs, index) => (
              <div key={index} className="flex items-center justify-between flex-wrap sm:flex-nowrap gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-sm sm:text-base break-words">{produs.nume}</p>
                  <p className="text-xs sm:text-sm text-gray-500 break-words">{produs.cantitate}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-medium text-sm sm:text-base break-words">{produs.valoare}</p>
                  <p className={`text-xs sm:text-sm ${produs.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {produs.trend}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
