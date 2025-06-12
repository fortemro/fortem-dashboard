
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { ProductItemForm } from './ProductItemForm';
import { OrderSummary } from './OrderSummary';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface ProductListProps {
  items: ItemComanda[];
  produse: Produs[];
  loadingProduse: boolean;
  selectedDistribuitor: string;
  onAddItem: () => void;
  onUpdateItem: (index: number, field: keyof ItemComanda, value: string | number) => void;
  onDeleteItem: (index: number) => void;
}

export function ProductList({
  items,
  produse,
  loadingProduse,
  selectedDistribuitor,
  onAddItem,
  onUpdateItem,
  onDeleteItem
}: ProductListProps) {
  console.log('ProductList - produse count:', produse.length);
  console.log('ProductList - loadingProduse:', loadingProduse);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
          <CardTitle className="text-lg sm:text-xl">Produse</CardTitle>
          <div className="flex flex-col items-start sm:items-end space-y-2">
            <Button 
              type="button" 
              onClick={onAddItem} 
              disabled={loadingProduse}
              className="relative w-full sm:w-auto text-sm"
              size="sm"
            >
              {loadingProduse ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adaugă Produs
            </Button>
            
            {loadingProduse && (
              <p className="text-xs text-blue-600 text-left sm:text-right">
                Se încarcă produsele...
              </p>
            )}
            
            {!loadingProduse && produse.length === 0 && (
              <p className="text-xs text-orange-600 text-left sm:text-right">
                Nu există produse în catalog
              </p>
            )}
            
            {!loadingProduse && produse.length > 0 && (
              <p className="text-xs text-green-600 text-left sm:text-right">
                {produse.length} produse disponibile în catalog
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3 sm:space-y-4">
          {items.map((item, index) => (
            <ProductItemForm
              key={index}
              item={item}
              index={index}
              produse={produse}
              onUpdate={onUpdateItem}
              onDelete={onDeleteItem}
            />
          ))}
        </div>

        {items.length > 0 && (
          <div className="mt-4 sm:mt-6">
            <OrderSummary items={items} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
