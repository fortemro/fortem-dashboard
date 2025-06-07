
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { Form } from '@/components/ui/form';
import { DistributorSelector } from './DistributorSelector';
import { DeliveryForm } from './DeliveryForm';
import { ProductList } from './ProductList';
import { OrderSummary } from './OrderSummary';
import { OrderFormActions } from './OrderFormActions';
import { OrderSuccessModal } from './OrderSuccessModal';
import { useOrderSubmission } from './OrderSubmissionHandler';
import { useProduse } from '@/hooks/useProduse';
import { useCart } from '@/contexts/CartContext';
import { useComenzi } from '@/hooks/useComenzi';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function ComandaForm() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;
  
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [selectedDistributorName, setSelectedDistributorName] = useState('');
  const { produse, loading: loadingProduse } = useProduse();
  const { cartItems, clearCart } = useCart();
  const { getComandaById } = useComenzi();
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const form = useForm({
    defaultValues: {
      distribuitor_id: '',
      oras_livrare: '',
      adresa_livrare: '',
      judet_livrare: '',
      telefon_livrare: '',
      observatii: '',
      numar_paleti: 0
    }
  });

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

  // Load order data for editing
  useEffect(() => {
    if (isEditMode && editId) {
      loadOrderForEditing();
    }
  }, [isEditMode, editId]);

  const loadOrderForEditing = async () => {
    if (!editId) return;

    setLoadingOrder(true);
    try {
      const orderData = await getComandaById(editId);
      console.log('Loading order for editing:', orderData);

      // Pre-fill form with order data
      form.setValue('distribuitor_id', orderData.distribuitor_id || '');
      form.setValue('oras_livrare', orderData.oras_livrare || '');
      form.setValue('adresa_livrare', orderData.adresa_livrare || '');
      form.setValue('judet_livrare', orderData.judet_livrare || '');
      form.setValue('telefon_livrare', orderData.telefon_livrare || '');
      form.setValue('observatii', orderData.observatii || '');
      
      // Set distributor data properly
      setSelectedDistributorId(orderData.distribuitor_id || '');
      setSelectedDistributorName(orderData.distribuitor?.nume_companie || orderData.distribuitor_id || '');

      // Pre-fill items - safely handle product data
      if (orderData.items && Array.isArray(orderData.items)) {
        const orderItems = orderData.items.map(item => ({
          produs_id: item.produs?.id || item.produs_id,
          nume_produs: item.produs?.nume || 'Produs necunoscut',
          cantitate: item.cantitate || 0,
          pret_unitar: item.pret_unitar || 0
        }));
        setItems(orderItems);
      }
    } catch (error) {
      console.error('Error loading order for editing:', error);
    } finally {
      setLoadingOrder(false);
    }
  };

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
          
          // Pre-fill form with order data
          if (parsedData.distribuitor_id) {
            form.setValue('distribuitor_id', parsedData.distribuitor_id);
            setSelectedDistributorId(parsedData.distribuitor_id);
            setSelectedDistributorName(parsedData.distribuitor_id);
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

  const handleSuccess = (successOrderData: any) => {
    setOrderData(successOrderData);
    setShowSuccessModal(true);
    clearCart();
    setItems([]);
  };

  const { submitOrder } = useOrderSubmission({
    produse,
    items,
    onSuccess: handleSuccess
  });

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setOrderData(null);
  };

  const handleDistributorChange = (distributorId: string, distributorName: string) => {
    console.log('Distributor changed to:', distributorId, distributorName);
    setSelectedDistributorId(distributorId);
    setSelectedDistributorName(distributorName);
    form.setValue('distribuitor_id', distributorId);
  };

  const handleAddItem = () => {
    setItems([...items, {
      produs_id: '',
      nume_produs: '',
      cantitate: 1,
      pret_unitar: 0
    }]);
  };

  const handleUpdateItem = (index: number, field: keyof ItemComanda, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleReset = () => {
    form.reset();
    setItems([]);
    setSelectedDistributorId('');
    setSelectedDistributorName('');
  };

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
  );
}
