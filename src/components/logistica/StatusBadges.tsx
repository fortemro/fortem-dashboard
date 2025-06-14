
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface StockStatus {
  type: 'loading' | 'available' | 'insufficient';
  productName?: string;
  missingQuantity?: number;
}

interface StatusBadgesProps {
  stockStatus?: StockStatus;
  orderStatus: string;
}

export function StockStatusBadge({ stockStatus }: { stockStatus?: StockStatus }) {
  if (!stockStatus || stockStatus.type === 'loading') {
    return (
      <div className="flex items-center text-gray-500">
        <Clock className="h-4 w-4 mr-1" />
        <span className="text-sm">Se verifică...</span>
      </div>
    );
  }
  
  if (stockStatus.type === 'available') {
    return (
      <div className="flex items-center text-green-600">
        <CheckCircle className="h-4 w-4 mr-1" />
        <span className="text-sm font-medium">În Stoc</span>
      </div>
    );
  } else {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center text-red-600 hover:text-red-800 transition-colors cursor-pointer">
            <AlertTriangle className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium underline">Stoc Insuficient</span>
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Stoc Insuficient
            </h4>
            <div className="text-sm text-gray-700">
              <p><strong>Produs:</strong> {stockStatus.productName}</p>
              <p><strong>Cantitate lipsă:</strong> {stockStatus.missingQuantity} buc</p>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              Click pentru a închide
            </div>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
}

export function OrderStatusBadge({ orderStatus }: { orderStatus: string }) {
  return (
    <Badge variant="secondary">
      {orderStatus}
    </Badge>
  );
}
