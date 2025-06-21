
import { useEffect, useRef } from 'react';
import { useProduse } from '@/hooks/useProduse';
import { useComenzi } from '@/hooks/useComenzi';
import { useOrderLoader } from './comanda/useOrderLoader';
import { useComandaFormState } from './comanda/useComandaFormState';
import { useItemsManager } from './comanda/useItemsManager';
import { useDuplicateOrderData } from './comanda/useDuplicateOrderData';

export function useComandaForm() {
  const { produse, loading: loadingProduse } = useProduse();
  const { getComandaById } = useComenzi();
  
  const {
    isEditMode,
    editId,
    loadingOrder,
    setLoadingOrder,
    loadOrderForEditing
  } = useOrderLoader();

  const {
    form,
    selectedDistributorId,
    selectedDistributorName,
    showSuccessModal,
    orderData,
    setSelectedDistributorId,
    setSelectedDistributorName,
    handleSuccess,
    handleCloseSuccessModal,
    handleDistributorChange,
    handleReset
  } = useComandaFormState();

  const {
    items,
    setItems,
    clearCart,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem
  } = useItemsManager(isEditMode);

  // Use duplicate order data hook
  useDuplicateOrderData(
    form,
    isEditMode,
    setSelectedDistributorId,
    setSelectedDistributorName,
    setItems
  );

  // Track if we've already loaded this order to prevent multiple loads
  const loadedOrderId = useRef<string | null>(null);

  // Load order data when in edit mode
  useEffect(() => {
    // Only load if we're in edit mode, have an ID, and haven't loaded this order yet
    if (isEditMode && editId && loadedOrderId.current !== editId) {
      console.log('Loading order for first time:', editId);
      loadedOrderId.current = editId;
      
      loadOrderForEditing().then((result) => {
        if (result) {
          form.reset(result.formData);
          setSelectedDistributorId(result.distributorId);
          setSelectedDistributorName(result.distributorName);
          setItems(result.items);
        }
      });
    }
    
    // Reset the loaded order ID when switching out of edit mode
    if (!isEditMode) {
      loadedOrderId.current = null;
    }
  }, [isEditMode, editId]); // Removed form, setSelectedDistributorId, setSelectedDistributorName, setItems, loadOrderForEditing from dependencies

  const handleSuccessWithClear = (successOrderData: any) => {
    handleSuccess(successOrderData);
    clearCart();
    setItems([]);
  };

  const handleResetWithClear = () => {
    handleReset();
    setItems([]);
  };

  return {
    form,
    isEditMode,
    editId,
    selectedDistributorId,
    selectedDistributorName,
    produse,
    loadingProduse,
    items,
    showSuccessModal,
    orderData,
    loadingOrder,
    setItems,
    setLoadingOrder,
    setSelectedDistributorId,
    setSelectedDistributorName,
    handleSuccess: handleSuccessWithClear,
    handleCloseSuccessModal,
    handleDistributorChange,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleReset: handleResetWithClear,
    getComandaById
  };
}
