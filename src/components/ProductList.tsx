
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Loader2, AlertTriangle } from 'lucide-react';
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
  const isAddProductDisabled = loadingProduse || !selectedDistribuitor;

  console.log('ProductList - selectedDistribuitor:', selectedDistribuitor);
  console.log('ProductList - produse:', produse);
  console.log('ProductList - loadingProduse:', loadingProduse);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Produse</CardTitle>
          <div className="flex flex-col items-end space-y-2">
            <Button 
              type="button" 
              onClick={onAddItem} 
              disabled={isAddProductDisabled}
              className="relative"
            >
              {loadingProduse ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Adaugă Produs
            </Button>
            
            {!selectedDistribuitor && (
              <div className="flex items-center space-x-1 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Selectați mai întâi un distribuitor</span>
              </div>
            )}
            
            {selectedDistribuitor && loadingProduse && (
              <p className="text-xs text-blue-600 text-right">
                Se încarcă produsele...
              </p>
            )}
            
            {selectedDistribuitor && !loadingProduse && produse.length === 0 && (
              <p className="text-xs text-orange-600 text-right">
                Nu există produse pentru distribuitorul selectat
              </p>
            )}
            
            {selectedDistribuitor && !loadingProduse && produse.length > 0 && (
              <p className="text-xs text-green-600 text-right">
                {produse.length} produse disponibile
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!selectedDistribuitor && (
          <div className="p-6 text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <AlertTriangle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Selectați un distribuitor</p>
            <p className="text-gray-500 text-sm">
              Pentru a adăuga produse, trebuie să selectați mai întâi un distribuitor din secțiunea de mai sus.
            </p>
          </div>
        )}

        {selectedDistribuitor && items.map((item, index) => (
          <ProductItemForm
            key={index}
            item={item}
            index={index}
            produse={produse}
            onUpdate={onUpdateItem}
            onDelete={onDeleteItem}
          />
        ))}

        {selectedDistribuitor && items.length > 0 && <OrderSummary items={items} />}
      </CardContent>
    </Card>
  );
}
