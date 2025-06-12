
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProduseGrid } from '@/components/ProduseGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Package, ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function Produse() {
  const { cartItems, getTotalItems } = useCart();
  const navigate = useNavigate();

  const handleGoToOrder = () => {
    navigate('/comanda');
  };

  const getTotalPaleti = () => {
    return cartItems.reduce((total, item) => total + item.cantitate, 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
            <div className="flex items-center">
              <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 mr-2 sm:mr-3" />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Catalog Produse</h1>
            </div>
            
            {/* Cart summary and go to order button */}
            {cartItems.length > 0 && (
              <Card className="bg-blue-50 border-blue-200 w-full lg:w-auto">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                      <span className="text-xs sm:text-sm font-medium text-blue-900">
                        {cartItems.length} produse • {getTotalPaleti()} {getTotalPaleti() === 1 ? 'palet' : 'paleti'}
                      </span>
                    </div>
                    <Button onClick={handleGoToOrder} size="sm" className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto text-xs sm:text-sm">
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Mergi la comandă
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <ProduseGrid />
      </div>
    </div>
  );
}
