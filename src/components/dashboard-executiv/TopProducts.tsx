
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
    <Card>
      <CardHeader>
        <CardTitle>Top Produse</CardTitle>
        <CardDescription>Cele mai vândute produse în perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((produs, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{produs.nume}</p>
                <p className="text-sm text-gray-500">{produs.cantitate}</p>
              </div>
              <div className="text-right">
                <p className="font-medium">{produs.valoare}</p>
                <p className={`text-sm ${produs.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {produs.trend}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
