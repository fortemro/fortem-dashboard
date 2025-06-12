
import React from 'react';
import { Form } from '@/components/ui/form';
import { DistributorSelector } from './DistributorSelector';
import { DeliveryForm } from './DeliveryForm';
import { ProductList } from './ProductList';
import { OrderSummary } from './OrderSummary';
import { OrderFormActions } from './OrderFormActions';
import { OrderSuccessModal } from './OrderSuccessModal';
import { useOrderSubmission } from './OrderSubmissionHandler';
import { useComandaForm } from '@/hooks/useComandaForm';

export function ComandaForm() {
  const {
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
    handleSuccess,
    handleCloseSuccessModal,
    handleDistributorChange,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem,
    handleReset,
    getComandaById
  } = useComandaForm();

   const { submitOrder } = useOrderSubmission({
    items,
    onSuccess: handleSuccess
  });

  const onSubmit = async (data: any) => {
    console.log('Form data on submit:', data);
    console.log('Selected distributor ID:', selectedDistributorId);
    console.log('Selected distributor name:', selectedDistributorName);
    
    const submitData = {
      ...data,
      distribuitor_id: selectedDistributorId || data.distribuitor_id
    };
    
    await submitOrder(submitData);
  };

  console.log('ComandaForm render - isEditMode:', isEditMode, 'editId:', editId, 'loadingOrder:', loadingOrder);

  if (loadingOrder) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4">
        <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
        <p className="ml-0 mt-4 text-center text-sm sm:text-base">Se încarcă datele comenzii...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-none">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
              <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">
                Editare Comandă
              </h2>
              <p className="text-sm sm:text-base text-blue-600">
                Modificați detaliile comenzii și apăsați "Salvează Modificările" pentru a actualiza comanda.
              </p>
            </div>
          )}
          
          <DistributorSelector
            form={form}
            onDistributorChange={handleDistributorChange}
            selectedDistributor={selectedDistributorId}
          />
          
          <DeliveryForm form={form} />
          
          <ProductList 
            items={items}
            produse={produse}
            loadingProduse={loadingProduse}
            selectedDistribuitor={selectedDistributorName}
            onAddItem={handleAddItem}
            onUpdateItem={handleUpdateItem}
            onDeleteItem={handleDeleteItem}
          />
          
          <OrderSummary items={items} />
          
          <OrderFormActions onReset={handleReset} isEditMode={isEditMode} />
          
          {orderData && (
            <OrderSuccessModal
              isOpen={showSuccessModal}
              onClose={handleCloseSuccessModal}
              orderData={orderData}
            />
          )}
        </form>
      </Form>
    </div>
  );
}
