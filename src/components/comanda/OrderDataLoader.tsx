
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface OrderDataLoaderProps {
  isEditMode: boolean;
  editId: string | null;
  form: UseFormReturn<any>;
  setLoadingOrder: (loading: boolean) => void;
  setSelectedDistributorId: (id: string) => void;
  setSelectedDistributorName: (name: string) => void;
  setItems: (items: ItemComanda[]) => void;
  getComandaById: (id: string) => Promise<any>;
}

export function OrderDataLoader({
  isEditMode,
  editId,
  form,
  setLoadingOrder,
  setSelectedDistributorId,
  setSelectedDistributorName,
  setItems,
  getComandaById
}: OrderDataLoaderProps) {
  
  useEffect(() => {
    if (isEditMode && editId) {
      loadOrderForEditing();
    }
  }, [isEditMode, editId]);

  const loadOrderForEditing = async () => {
    if (!editId) return;

    setLoadingOrder(true);
    try {
      const orderData = await getComandaById(editId);
      console.log('Loading order for editing:', orderData);

      // Pre-fill form with order data
      form.setValue('distribuitor_id', orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '');
      form.setValue('oras_livrare', orderData.oras_livrare || '');
      form.setValue('adresa_livrare', orderData.adresa_livrare || '');
      form.setValue('judet_livrare', orderData.judet_livrare || '');
      form.setValue('telefon_livrare', orderData.telefon_livrare || '');
      form.setValue('observatii', orderData.observatii || '');
      
      // Set distributor data properly - use name not ID
      const distributorName = orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '';
      setSelectedDistributorId(distributorName);
      setSelectedDistributorName(distributorName);

      // Pre-fill items - safely handle product data
      if (orderData.items && Array.isArray(orderData.items)) {
        const orderItems = orderData.items.map((item: any) => ({
          produs_id: item.produs?.id || item.produs_id,
          nume_produs: item.produs?.nume || 'Produs necunoscut',
          cantitate: item.cantitate || 0,
          pret_unitar: item.pret_unitar || 0
        }));
        setItems(orderItems);
      }
    } catch (error) {
      console.error('Error loading order for editing:', error);
    } finally {
      setLoadingOrder(false);
    }
  };

  return null; // This is a logic-only component
}
