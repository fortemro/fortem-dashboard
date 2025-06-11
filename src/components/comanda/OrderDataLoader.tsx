
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
  
  useEffect(() => {
    // Doar încarcă data dacă suntem în edit mode și avem un ID valid
    if (!isEditMode || !editId) {
      return;
    }

    let cancelled = false;

    const loadOrderForEditing = async () => {
      setLoadingOrder(true);
      try {
        const orderData = await getComandaById(editId);
        
        // Verifică dacă request-ul a fost anulat
        if (cancelled) return;

        console.log('Loading order for editing:', orderData);

        if (!orderData) {
          console.error('No order data found for id:', editId);
          return;
        }

        // Pre-fill form with order data
        form.reset({
          distribuitor_id: orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '',
          oras_livrare: orderData.oras_livrare || '',
          adresa_livrare: orderData.adresa_livrare || '',
          judet_livrare: orderData.judet_livrare || '',
          telefon_livrare: orderData.telefon_livrare || '',
          observatii: orderData.observatii || ''
        });
        
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
        if (!cancelled) {
          console.error('Error loading order for editing:', error);
        }
      } finally {
        if (!cancelled) {
          setLoadingOrder(false);
        }
      }
    };

    loadOrderForEditing();

    // Cleanup function pentru a anula request-ul dacă componenta se demontează
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editId]); // Doar aceste dependințe critice

  return null; // This is a logic-only component
}
