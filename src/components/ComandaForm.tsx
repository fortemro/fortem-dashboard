
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  const { produse, loading: loadingProduse } = useProduse();
  const { cartItems, clearCart } = useCart();
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const form = useForm({
    defaultValues: {
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
        // Pre-fill form with duplicate data
        console.log('Loading duplicate order data:', parsedData);
        localStorage.removeItem('duplicateOrderData');
      } catch (error) {
        console.error('Error parsing duplicate order data:', error);
      }
    }
  }, []);

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
  };

  const onSubmit = async (data: any) => {
    await submitOrder(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <DeliveryForm form={form} />
      <ProductList 
        items={items}
        produse={produse}
        loadingProduse={loadingProduse}
        selectedDistribuitor=""
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
  );
}
