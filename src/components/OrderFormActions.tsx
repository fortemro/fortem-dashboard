
import React from 'react';
import { Button } from '@/components/ui/button';
import { Calculator, Save } from 'lucide-react';

interface OrderFormActionsProps {
  onReset: () => void;
  isEditMode?: boolean;
}

export function OrderFormActions({ onReset, isEditMode = false }: OrderFormActionsProps) {
  return (
    <div className="flex justify-end space-x-4">
      <Button type="button" variant="outline" onClick={onReset}>
        Resetează
      </Button>
      <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
        {isEditMode ? (
          <>
            <Save className="h-5 w-5 mr-2" />
            Salvează Modificările
          </>
        ) : (
          <>
            <Calculator className="h-5 w-5 mr-2" />
            Trimite Comanda
          </>
        )}
      </Button>
    </div>
  );
}
