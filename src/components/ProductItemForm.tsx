
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface ProductItemFormProps {
  item: ItemComanda;
  index: number;
  produse: Produs[];
  onUpdate: (index: number, field: keyof ItemComanda, value: string | number) => void;
  onDelete: (index: number) => void;
}

export function ProductItemForm({ 
  item, 
  index, 
  produse, 
  onUpdate, 
  onDelete 
}: ProductItemFormProps) {
  const selectedProduct = produse.find(p => p.id === item.produs_id);
  const bucatiPerPalet = selectedProduct?.bucati_per_palet || 0;
  const totalBucati = item.cantitate * bucatiPerPalet;
  const stocDisponibil = selectedProduct?.stoc_disponibil || 0;
  const depasesteStocul = item.cantitate > stocDisponibil && selectedProduct;

  // Funcție pentru a gestiona schimbarea prețului
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Dacă câmpul este gol, setez la 0
    if (value === '') {
      onUpdate(index, 'pret_unitar', 0);
      return;
    }
    
    // Încerc să convertesc la număr
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onUpdate(index, 'pret_unitar', numericValue);
    }
  };

  // Funcție pentru a gestiona focus-ul pe câmpul de preț
  const handlePriceFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Dacă valoarea este 0, selectez tot textul pentru ușurința înlocuirii
    if (item.pret_unitar === 0) {
      e.target.select();
    }
  };

  // Afișez valoarea prețului - string gol dacă este 0, altfel valoarea actuală
  const displayPrice = item.pret_unitar === 0 ? '' : item.pret_unitar.toString();

  return (
    <Card className="mb-4">
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <Label>Produs *</Label>
            <Select
              value={item.produs_id}
              onValueChange={(value) => onUpdate(index, 'produs_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selectează produs" />
              </SelectTrigger>
              <SelectContent>
                {produse.map((produs) => (
                  <SelectItem key={produs.id} value={produs.id}>
                    <span className="flex items-center">
                      <span>{produs.nume}</span>
                      <span 
                        className={`ml-2 text-sm ${
                          produs.stoc_disponibil === 0 
                            ? 'text-red-600 font-medium' 
                            : 'text-gray-500'
                        }`}
                      >
                        (Stoc: {produs.stoc_disponibil || 0})
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cantitate (Paleti) *</Label>
            <Input
              type="number"
              value={item.cantitate}
              onChange={(e) => onUpdate(index, 'cantitate', parseInt(e.target.value) || 0)}
              placeholder="0"
              min="1"
              className={depasesteStocul ? 'border-orange-500 focus:border-orange-500' : ''}
            />
            {bucatiPerPalet > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                = {totalBucati} bucăți
              </p>
            )}
          </div>

          <div>
            <Label>Preț/Palet (RON) *</Label>
            <Input
              type="number"
              step="0.01"
              value={displayPrice}
              onChange={handlePriceChange}
              onFocus={handlePriceFocus}
              placeholder="Introduceți prețul"
              className="font-semibold"
            />
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onDelete(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {depasesteStocul && (
          <Alert className="mt-3 border-orange-500 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Atenție:</strong> cantitatea depășește stocul disponibil! 
              (Solicitat: {item.cantitate}, Disponibil: {stocDisponibil})
            </AlertDescription>
          </Alert>
        )}

        {item.cantitate > 0 && item.pret_unitar > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <div className="flex justify-between text-sm">
              <span>Total produs:</span>
              <span className="font-semibold">
                {(item.cantitate * item.pret_unitar).toFixed(2)} RON
              </span>
            </div>
            {bucatiPerPalet > 0 && (
              <div className="flex justify-between text-xs text-gray-600">
                <span>Cantitate totală:</span>
                <span>{item.cantitate} paleti ({totalBucati} bucăți)</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
