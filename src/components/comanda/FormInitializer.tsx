
import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

interface FormInitializerProps {
  isEditMode: boolean;
  cartItems: any[];
  form: UseFormReturn<any>;
  setItems: (items: ItemComanda[]) => void;
  setSelectedDistributorId: (id: string) => void;
  setSelectedDistributorName: (name: string) => void;
}

export function FormInitializer({
  isEditMode,
  cartItems,
  form,
  setItems,
  setSelectedDistributorId,
  setSelectedDistributorName
}: FormInitializerProps) {

  // Initialize items from cart
  useEffect(() => {
    if (cartItems.length > 0 && !isEditMode) {
      const cartBasedItems = cartItems.map(cartItem => ({
        produs_id: cartItem.produs.id,
        nume_produs: cartItem.produs.nume,
        cantitate: cartItem.cantitate,
        pret_unitar: 0 // Will be set manually
      }));
      setItems(cartBasedItems);
    }
  }, [cartItems, isEditMode]);

  // Check for duplicate/edit order data on mount
  useEffect(() => {
    if (!isEditMode) {
      const duplicateData = localStorage.getItem('duplicateOrderData');
      const editData = localStorage.getItem('editOrderData');
      
      const dataToLoad = duplicateData || editData;
      
      if (dataToLoad) {
        try {
          const parsedData = JSON.parse(dataToLoad);
          console.log('Loading order data:', parsedData);
          
          // Pre-fill form with order data - for duplication, use distributor name
          if (parsedData.distribuitor_name) {
            form.setValue('distribuitor_id', parsedData.distribuitor_name);
            setSelectedDistributorId(parsedData.distribuitor_name);
            setSelectedDistributorName(parsedData.distribuitor_name);
          }
          if (parsedData.oras_livrare) form.setValue('oras_livrare', parsedData.oras_livrare);
          if (parsedData.adresa_livrare) form.setValue('adresa_livrare', parsedData.adresa_livrare);
          if (parsedData.judet_livrare) form.setValue('judet_livrare', parsedData.judet_livrare);
          if (parsedData.telefon_livrare) form.setValue('telefon_livrare', parsedData.telefon_livrare);
          if (parsedData.observatii) form.setValue('observatii', parsedData.observatii);
          
          // Pre-fill items if available
          if (parsedData.items && Array.isArray(parsedData.items)) {
            setItems(parsedData.items);
          }
          
          localStorage.removeItem('duplicateOrderData');
          localStorage.removeItem('editOrderData');
        } catch (error) {
          console.error('Error parsing order data:', error);
        }
      }
    }
  }, [form, isEditMode]);

  return null; // This is a logic-only component
}
