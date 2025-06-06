
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-react';
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
                    {produs.nume}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Cantitate *</Label>
            <Input
              type="number"
              value={item.cantitate}
              onChange={(e) => onUpdate(index, 'cantitate', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>

          <div>
            <Label>Preț Vânzare Manual (RON) *</Label>
            <Input
              type="number"
              step="0.01"
              value={item.pret_unitar}
              onChange={(e) => onUpdate(index, 'pret_unitar', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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

        {item.cantitate > 0 && item.pret_unitar > 0 && (
          <div className="mt-2 p-2 bg-gray-50 rounded">
            <div className="flex justify-between text-sm">
              <span>Total produs:</span>
              <span className="font-semibold">
                {(item.cantitate * item.pret_unitar).toFixed(2)} RON
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
