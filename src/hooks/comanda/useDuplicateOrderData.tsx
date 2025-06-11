
import { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function useDuplicateOrderData(
  form: UseFormReturn<any>,
  isEditMode: boolean,
  setSelectedDistributorId: (id: string) => void,
  setSelectedDistributorName: (name: string) => void,
  setItems: (items: ItemComanda[]) => void
) {
  // Check for duplicate order data on mount - doar când nu suntem în edit mode
  useEffect(() => {
    if (!isEditMode) {
      const duplicateData = localStorage.getItem('duplicateOrderData');
      
      if (duplicateData) {
        try {
          const parsedData = JSON.parse(duplicateData);
          console.log('Loading duplicate order data:', parsedData);
          
          const distributorToUse = parsedData.distribuitor_name || parsedData.distribuitor_id;
          if (distributorToUse) {
            form.setValue('distribuitor_id', distributorToUse);
            setSelectedDistributorId(distributorToUse);
            setSelectedDistributorName(distributorToUse);
          }
          if (parsedData.oras_livrare) form.setValue('oras_livrare', parsedData.oras_livrare);
          if (parsedData.adresa_livrare) form.setValue('adresa_livrare', parsedData.adresa_livrare);
          if (parsedData.judet_livrare) form.setValue('judet_livrare', parsedData.judet_livrare);
          if (parsedData.telefon_livrare) form.setValue('telefon_livrare', parsedData.telefon_livrare);
          if (parsedData.observatii) form.setValue('observatii', parsedData.observatii);
          
          if (parsedData.items && Array.isArray(parsedData.items)) {
            const validItems = parsedData.items.filter((item: any) => 
              item.produs_id && item.nume_produs && 
              typeof item.cantitate === 'number' && 
              typeof item.pret_unitar === 'number'
            );
            if (validItems.length > 0) {
              setItems(validItems);
            }
          }
          
          localStorage.removeItem('duplicateOrderData');
        } catch (error) {
          console.error('Error parsing duplicate order data:', error);
        }
      }
    }
  }, [form, isEditMode, setSelectedDistributorId, setSelectedDistributorName, setItems]);
}
