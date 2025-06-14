
import { Badge } from '@/components/ui/badge';

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
      <Badge variant="secondary">
        Se verifică...
      </Badge>
    );
  }
  
  if (stockStatus.type === 'available') {
    return (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-300">
        În Stoc
      </Badge>
    );
  } else {
    return (
      <Badge variant="destructive">
        Lipsă: {stockStatus.productName} (-{stockStatus.missingQuantity} buc)
      </Badge>
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
