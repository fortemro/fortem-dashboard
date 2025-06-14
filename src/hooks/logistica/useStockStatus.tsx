
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Comanda } from '@/types/comanda';

interface StockStatus {
  type: 'loading' | 'available' | 'insufficient';
  productName?: string;
  missingQuantity?: number;
}

interface ComandaWithStockStatus extends Comanda {
  stockStatus?: StockStatus;
}

export function useStockStatus(comenzi: Comanda[]) {
  const [comenziWithStockStatus, setComenziWithStockStatus] = useState<ComandaWithStockStatus[]>([]);

  // Function to check stock status for a specific order
  const checkStockStatusForOrder = async (comanda: Comanda): Promise<StockStatus> => {
    try {
      // Get order items
      const { data: itemsData, error: itemsError } = await supabase
        .from('itemi_comanda')
        .select('produs_id, cantitate')
        .eq('comanda_id', comanda.id);

      if (itemsError) {
        console.error('Error fetching items for order:', comanda.id, itemsError);
        return { type: 'loading' };
      }

      if (!itemsData || itemsData.length === 0) {
        return { type: 'available' };
      }

      // Get real stock data
      const { data: stocuriReale, error: stocuriError } = await supabase
        .rpc('get_stocuri_reale_pentru_produse');

      if (stocuriError) {
        console.error('Error fetching real stock:', stocuriError);
        return { type: 'loading' };
      }

      // Create a map of product ID to real stock
      const stocuriMap = new Map(
        stocuriReale?.map(item => [item.produs_id, item.stoc_real]) || []
      );

      // Check each item in the order
      for (const item of itemsData) {
        const realStock = stocuriMap.get(item.produs_id) || 0;
        
        if (realStock < item.cantitate) {
          // Get product name for the insufficient stock item
          const { data: productData, error: productError } = await supabase
            .from('produse')
            .select('nume')
            .eq('id', item.produs_id)
            .single();

          const productName = productData?.nume || 'Produs necunoscut';
          const missingQuantity = item.cantitate - realStock;

          return {
            type: 'insufficient',
            productName,
            missingQuantity
          };
        }
      }

      // All items have sufficient stock
      return { type: 'available' };
    } catch (error) {
      console.error('Error checking stock for order:', comanda.id, error);
      return { type: 'loading' };
    }
  };

  // Effect to check stock status for all orders
  useEffect(() => {
    const checkAllStockStatuses = async () => {
      if (!comenzi.length) {
        setComenziWithStockStatus([]);
        return;
      }

      // Initialize with loading status
      const initialComenzi = comenzi.map(comanda => ({
        ...comanda,
        stockStatus: { type: 'loading' as const }
      }));
      setComenziWithStockStatus(initialComenzi);

      // Check stock status for each order
      const updatedComenzi = await Promise.all(
        comenzi.map(async (comanda) => {
          const stockStatus = await checkStockStatusForOrder(comanda);
          return {
            ...comanda,
            stockStatus
          };
        })
      );

      setComenziWithStockStatus(updatedComenzi);
    };

    checkAllStockStatuses();
  }, [comenzi]);

  return { comenziWithStockStatus };
}
