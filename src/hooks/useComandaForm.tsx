
import { useEffect } from 'react';
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

  // Load order data when in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadOrderForEditing().then((result) => {
        if (result) {
          form.reset(result.formData);
          setSelectedDistributorId(result.distributorId);
          setSelectedDistributorName(result.distributorName);
          setItems(result.items);
        }
      });
    }
  }, [isEditMode, editId, loadOrderForEditing, form, setSelectedDistributorId, setSelectedDistributorName, setItems]);

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
