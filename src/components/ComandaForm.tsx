import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { DistributorSelector } from './DistributorSelector';
import { DeliveryForm } from './DeliveryForm';
import { ProductList } from './ProductList';
import { OrderSummary } from './OrderSummary';
import { OrderFormActions } from './OrderFormActions';
import { OrderSuccessModal } from './OrderSuccessModal';
import { useOrderSubmission } from './OrderSubmissionHandler';
import { useComandaForm } from '@/hooks/useComandaForm';
import { OrderDataLoader } from './comanda/OrderDataLoader';
import { FormInitializer } from './comanda/FormInitializer';

export function ComandaForm() {
  const {
    form,
    isEditMode,
    editId,
    selectedDistributorId,
    selectedDistributorName,
    produse,
    loadingProduse,
    cartItems,
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
    await submitOrder({ ...data, items });
  };

  if (loadingOrder) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="ml-4">Se încarcă datele comenzii...</p>
      </div>
    );
  }

  return (
    <>
      <OrderDataLoader
        isEditMode={isEditMode}
        editId={editId}
        form={form}
        setLoadingOrder={setLoadingOrder}
        setSelectedDistributorId={setSelectedDistributorId}
        setSelectedDistributorName={setSelectedDistributorName}
        setItems={setItems}
        getComandaById={getComandaById}
      />
      
      {/* AM REINTRODUS PROPRIETĂȚILE LIPSĂ AICI */}
      <FormInitializer
        form={form}
        isEditMode={isEditMode}
        cartItems={cartItems}
        setItems={setItems}
        setSelectedDistributorId={setSelectedDistributorId}
        setSelectedDistributorName={setSelectedDistributorName}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* ... restul formularului ... */}

          <DistributorSelector
            form={form}
            onDistributorChange={handleDistributorChange}
            selectedDistributor={selectedDistributorId}
          />
          
          <DeliveryForm form={form} />

          <div className="p-4 border rounded-lg bg-slate-50">
              <h3 className="text-lg font-medium mb-4">Detalii Paleți & Preț</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="numar_paleti"
                      render={({ field }) => ( <FormItem> ... </FormItem> )}
                  />
                  <FormField
                      control={form.control}
                      name="pret_per_palet"
                      render={({ field }) => ( <FormItem> ... </FormItem> )}
                  />
              </div>
          </div>
          
          <ProductList 
            items={items}
            produse={produse}
            // ... restul proprietăților
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
    </>
  );
}