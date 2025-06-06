
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator } from 'lucide-react';

interface OrderFormActionsProps {
  onReset: () => void;
}

export function OrderFormActions({ onReset }: OrderFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onReset}>
        Resetează
      </Button>
      <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
        <Calculator className="h-5 w-5 mr-2" />
        Trimite Comanda
      </Button>
    </div>
  );
}
