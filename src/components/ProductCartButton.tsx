
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

interface ProductCartButtonProps {
  produs: Produs;
}

export function ProductCartButton({ produs }: ProductCartButtonProps) {
  const [cantitate, setCantitate] = useState(1);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = () => {
    // Validez stocul real disponibil pentru vânzare
    const stocRealDisponibil = (produs as any).stoc_real_disponibil || 0;
    
    if (cantitate > stocRealDisponibil) {
      toast({
        title: "Stoc insuficient",
        description: `Nu sunt disponibili ${cantitate} paleti. Stoc real disponibil: ${stocRealDisponibil}`,
        variant: "destructive",
      });
      return;
    }
    
    if (cantitate > 0) {
      addToCart(produs, cantitate);
      toast({
        title: "Produs adăugat",
        description: `${produs.nume} x${cantitate} ${cantitate === 1 ? 'palet' : 'paleti'} adăugat în coș`,
      });
      setCantitate(1); // Reset quantity after adding
    }
  };

  const incrementQuantity = () => {
    const stocRealDisponibil = (produs as any).stoc_real_disponibil || 0;
    setCantitate(prev => Math.min(prev + 1, stocRealDisponibil));
  };

  const decrementQuantity = () => {
    setCantitate(prev => Math.max(1, prev - 1));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={decrementQuantity}
          disabled={cantitate <= 1}
        >
          <Minus className="h-3 w-3" />
        </Button>
        
        <Input
          type="number"
          value={cantitate}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1;
            const stocRealDisponibil = (produs as any).stoc_real_disponibil || 0;
            setCantitate(Math.max(1, Math.min(val, stocRealDisponibil)));
          }}
          className="w-16 text-center"
          min="1"
          max={(produs as any).stoc_real_disponibil || 0}
        />
        
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={incrementQuantity}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="text-center">
        <span className="text-xs text-gray-600">Paleti</span>
      </div>
      
      <Button 
        onClick={handleAddToCart}
        className="w-full"
        size="sm"
        disabled={((produs as any).stoc_real_disponibil || 0) <= 0}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        {((produs as any).stoc_real_disponibil || 0) <= 0 ? 'Stoc epuizat' : 'Adaugă la comandă'}
      </Button>
    </div>
  );
}
