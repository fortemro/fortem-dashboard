
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
    console.log('Form data on submit:', data);
    console.log('Selected distributor ID:', selectedDistributorId);
    console.log('Selected distributor name:', selectedDistributorName);
    
    // Ensure distribuitor_id is included in the data
    const submitData = {
      ...data,
      distribuitor_id: selectedDistributorId || data.distribuitor_id
    };
    
    await submitOrder(submitData);
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
      
      <FormInitializer
        isEditMode={isEditMode}
        cartItems={cartItems}
        form={form}
        setItems={setItems}
        setSelectedDistributorId={setSelectedDistributorId}
        setSelectedDistributorName={setSelectedDistributorName}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                Editare Comandă
              </h2>
              <p className="text-blue-600">
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
    </>
<FormField
    control={form.control}
    name="pret_per_palet"
    render={({ field }) => (
        <FormItem>
            <FormLabel>Preț / Palet (RON)</FormLabel>
            <FormControl>
                <Input type="text" placeholder="ex: 1500.50" {...field}
                    onChange={e => {
                        if (/^\d*\.?\d*$/.test(e.target.value)) field.onChange(e.target.value);
                    }}
                />
            </FormControl>
        </FormItem>
    )}
/>
  );
}
