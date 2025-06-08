import React from 'react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'; // Am adăugat importurile necesare
import { Input } from '@/components/ui/input'; // Am adăugat importul necesar
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
    // Trimitem un singur obiect care conține și itemii
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
      
      <FormInitializer form={form} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {isEditMode && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800">Editare Comandă</h2>
              <p className="text-blue-600 mt-1">Modificați detaliile și apăsați "Salvează Modificările".</p>
            </div>
          )}
          
          <DistributorSelector
            form={form}
            onDistributorChange={handleDistributorChange}
            selectedDistributor={selectedDistributorId}
          />
          
          <DeliveryForm form={form} />

          {/* === BLOCUL DE COD PENTRU PRET/PALET INSERAT CORECT AICI === */}
          <div className="p-4 border rounded-lg bg-slate-50">
              <h3 className="text-lg font-medium mb-4">Detalii Paleți & Preț</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                      control={form.control}
                      name="numar_paleti"
                      render={({ field }) => (
                          <FormItem>
                              <FormLabel>Număr Paleți</FormLabel>
                              <FormControl>
                                  <Input type="number" placeholder="ex: 3" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                          </FormItem>
                      )}
                  />
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
                              <FormMessage />
                          </FormItem>
                      )}
                  />
              </div>
          </div>
          
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
  );
}