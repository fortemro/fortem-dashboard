
import React, { useEffect, useCallback } from 'react';
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
  
  const loadOrderForEditing = useCallback(async () => {
    if (!isEditMode || !editId) {
      setLoadingOrder(false);
      return;
    }

    console.log('Starting to load order for editing:', editId);
    setLoadingOrder(true);
    
    try {
      const orderData = await getComandaById(editId);
      console.log('Order data loaded:', orderData);

      if (!orderData) {
        console.error('No order data found for id:', editId);
        setLoadingOrder(false);
        return;
      }

      // Pre-fill form with order data
      const formData = {
        distribuitor_id: orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '',
        oras_livrare: orderData.oras_livrare || '',
        adresa_livrare: orderData.adresa_livrare || '',
        judet_livrare: orderData.judet_livrare || '',
        telefon_livrare: orderData.telefon_livrare || '',
        observatii: orderData.observatii || ''
      };
      
      console.log('Setting form data:', formData);
      form.reset(formData);
      
      // Set distributor data properly - use name not ID
      const distributorName = orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '';
      setSelectedDistributorId(distributorName);
      setSelectedDistributorName(distributorName);
      console.log('Set distributor:', distributorName);

      // Pre-fill items - safely handle product data
      if (orderData.items && Array.isArray(orderData.items)) {
        const orderItems = orderData.items.map((item: any) => ({
          produs_id: item.produs?.id || item.produs_id,
          nume_produs: item.produs?.nume || 'Produs necunoscut',
          cantitate: item.cantitate || 0,
          pret_unitar: item.pret_unitar || 0
        }));
        console.log('Setting items:', orderItems);
        setItems(orderItems);
      }

      console.log('Order loading completed successfully');
    } catch (error) {
      console.error('Error loading order for editing:', error);
    } finally {
      setLoadingOrder(false);
    }
  }, [isEditMode, editId, getComandaById, form, setLoadingOrder, setSelectedDistributorId, setSelectedDistributorName, setItems]);

  useEffect(() => {
    loadOrderForEditing();
  }, [loadOrderForEditing]);

  return null; // This is a logic-only component
}
