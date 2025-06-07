
import React from 'react';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface OrderSummaryProps {
  items: ItemComanda[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const total = items.reduce((sum, item) => sum + (item.cantitate * item.pret_unitar), 0);
  const totalPaleti = items.reduce((sum, item) => sum + item.cantitate, 0);

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span>Total Paleti:</span>
        <span className="font-medium">{totalPaleti} {totalPaleti === 1 ? 'palet' : 'paleti'}</span>
      </div>
      <div className="flex justify-between items-center border-t pt-2">
        <span className="text-lg font-semibold">Total Comandă:</span>
        <span className="text-xl font-bold text-blue-600">
          {total.toFixed(2)} RON
        </span>
      </div>
    </div>
  );
}
