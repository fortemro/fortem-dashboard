
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
    if (cantitate > 0) {
      addToCart(produs, cantitate);
      toast({
        title: "Produs adăugat",
        description: `${produs.nume} x${cantitate} adăugat în coș`,
      });
      setCantitate(1); // Reset quantity after adding
    }
  };

  const incrementQuantity = () => {
    setCantitate(prev => prev + 1);
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
          onChange={(e) => setCantitate(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 text-center"
          min="1"
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
      
      <Button 
        onClick={handleAddToCart}
        className="w-full"
        size="sm"
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Adaugă la comandă
      </Button>
    </div>
  );
}
