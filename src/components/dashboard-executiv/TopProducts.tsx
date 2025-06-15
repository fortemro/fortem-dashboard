
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Package } from "lucide-react";

interface TopProduct {
  nume: string;
  cantitate: number;
  valoare: number;
  trend: number;
  paleti: number;
}

interface TopProductsProps {
  products: TopProduct[];
  isLoading?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ro-RO', {
    style: 'currency',
    currency: 'RON',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export function TopProducts({ products, isLoading }: TopProductsProps) {
  if (isLoading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-lg sm:text-xl">Top Produse</CardTitle>
          <CardDescription className="text-sm">Cele mai vândute produse în perioada selectată</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="min-w-0 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
          <Package className="h-5 w-5 text-blue-600" />
          Top Produse
        </CardTitle>
        <CardDescription className="text-sm">Cele mai vândute produse în perioada selectată</CardDescription>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm sm:text-base">Nu există vânzări pentru perioada selectată</p>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((produs, index) => (
              <div key={index} className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold text-white
                      ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-400' : 'bg-blue-500'}
                    `}>
                      {index + 1}
                    </span>
                    <p className="font-medium text-sm sm:text-base break-words">{produs.nume}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                    <span>{produs.cantitate.toLocaleString('ro-RO')} bucăți</span>
                    <span>•</span>
                    <span>{produs.paleti} paleți</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-semibold text-sm sm:text-base text-green-700">
                    {formatCurrency(produs.valoare)}
                  </p>
                  <div className="flex items-center justify-end gap-1">
                    {produs.trend >= 0 ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={`text-xs sm:text-sm font-medium ${
                      produs.trend >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {produs.trend >= 0 ? '+' : ''}{produs.trend.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
