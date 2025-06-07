
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function ComandaForm() {
  const [selectedDistribuitorName, setSelectedDistribuitorName] = useState('');
  // Filtrează produsele după numele distribuitorului selectat
  const { produse, loading: loadingProduse } = useProduse(selectedDistribuitorName);
  const { cartItems, clearCart } = useCart();
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

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
    if (cartItems.length > 0) {
      const cartBasedItems = cartItems.map(cartItem => ({
        produs_id: cartItem.produs.id,
        nume_produs: cartItem.produs.nume,
        cantitate: cartItem.cantitate,
        pret_unitar: 0 // Will be set manually
      }));
      setItems(cartBasedItems);
    }
  }, [cartItems]);

  // Check for duplicate order data on mount
  useEffect(() => {
    const duplicateData = localStorage.getItem('duplicateOrderData');
    if (duplicateData) {
      try {
        const parsedData = JSON.parse(duplicateData);
        console.log('Loading duplicate order data:', parsedData);
        
        // Pre-fill form with duplicate data
        if (parsedData.distribuitor_id) {
          form.setValue('distribuitor_id', parsedData.distribuitor_id);
          setSelectedDistribuitorName(parsedData.distribuitor_id);
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
      } catch (error) {
        console.error('Error parsing duplicate order data:', error);
      }
    }
  }, [form]);

  // Clear items when distributor changes
  useEffect(() => {
    if (selectedDistribuitorName) {
      // Clear existing items when distributor changes to avoid mixing products from different distributors
      setItems([]);
    }
  }, [selectedDistribuitorName]);

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

  const handleDistributorChange = (distributorName: string) => {
    console.log('Distributor changed to:', distributorName);
    setSelectedDistribuitorName(distributorName);
    form.setValue('distribuitor_id', distributorName);
  };

  const handleAddItem = () => {
    if (!selectedDistribuitorName) {
      // This will be handled by validation, but we can show a visual cue
      return;
    }
    
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
    setSelectedDistribuitorName('');
  };

  const onSubmit = async (data: any) => {
    console.log('Form data on submit:', data);
    console.log('Selected distribuitor name:', selectedDistribuitorName);
    
    // Ensure distribuitor_id is included in the data
    const submitData = {
      ...data,
      distribuitor_id: selectedDistribuitorName || data.distribuitor_id
    };
    
    await submitOrder(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <DistributorSelector
          form={form}
          onDistributorChange={handleDistributorChange}
          selectedDistributor={selectedDistribuitorName}
        />
        
        <DeliveryForm form={form} />
        
        <ProductList 
          items={items}
          produse={produse}
          loadingProduse={loadingProduse}
          selectedDistribuitor={selectedDistribuitorName}
          onAddItem={handleAddItem}
          onUpdateItem={handleUpdateItem}
          onDeleteItem={handleDeleteItem}
        />
        
        <OrderSummary items={items} />
        
        <OrderFormActions onReset={handleReset} />
        
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
