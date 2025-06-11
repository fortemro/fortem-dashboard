
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useComenzi } from '@/hooks/useComenzi';
import type { Comanda } from '@/types/comanda';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function useOrderLoader() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  const [loadingOrder, setLoadingOrder] = useState(false);
  const { getComandaById } = useComenzi();

  const loadOrderForEditing = useCallback(async (): Promise<{
    formData: any;
    items: ItemComanda[];
    distributorId: string;
    distributorName: string;
  } | null> => {
    if (!isEditMode || !editId) {
      setLoadingOrder(false);
      return null;
    }

    console.log('Loading order for editing:', editId);
    setLoadingOrder(true);
    
    try {
      const orderData = await getComandaById(editId) as Comanda | null;
      console.log('Order data loaded:', orderData);

      if (!orderData) {
        console.error('No order data found for id:', editId);
        setLoadingOrder(false);
        return null;
      }

      // Pre-fill form with order data - using correct property names
      const distributorName = orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '';
      
      const formData = {
        distribuitor_id: distributorName,
        oras_livrare: orderData.oras_livrare || '',
        adresa_livrare: orderData.adresa_livrare || '',
        judet_livrare: orderData.judet_livrare || '',
        telefon_livrare: orderData.telefon_livrare || '',
        observatii: orderData.observatii || ''
      };
      
      console.log('Setting form data:', formData);

      // Pre-fill items - checking if items exist from the hook
      let orderItems: ItemComanda[] = [];
      if (orderData.items && Array.isArray(orderData.items)) {
        orderItems = orderData.items.map((item: any) => ({
          produs_id: item.produs?.id || item.produs_id,
          nume_produs: item.produs?.nume || 'Produs necunoscut',
          cantitate: item.cantitate || 0,
          pret_unitar: item.pret_unitar || 0
        }));
        console.log('Setting items:', orderItems);
      }

      console.log('Order loading completed successfully');
      
      return {
        formData,
        items: orderItems,
        distributorId: distributorName,
        distributorName
      };
    } catch (error) {
      console.error('Error loading order for editing:', error);
      return null;
    } finally {
      setLoadingOrder(false);
    }
  }, [isEditMode, editId, getComandaById]);

  return {
    isEditMode,
    editId,
    loadingOrder,
    setLoadingOrder,
    loadOrderForEditing
  };
}
