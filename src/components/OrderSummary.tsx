
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

  return (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">Total Comandă:</span>
        <span className="text-xl font-bold text-blue-600">
          {total.toFixed(2)} RON
        </span>
      </div>
    </div>
  );
}
