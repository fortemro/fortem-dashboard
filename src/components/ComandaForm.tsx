
import React, { useState, useEffect } from 'react';
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
  const { produse } = useProduse();
  const { cartItems, clearCart } = useCart();
  const [items, setItems] = useState<ItemComanda[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  // Initialize items from cart
  useEffect(() => {
    if (cartItems.length > 0) {
      const cartBasedItems = cartItems.map(cartItem => ({
        produs_id: cartItem.produs_id,
        nume_produs: cartItem.nume_produs,
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

  return (
    <div className="space-y-6">
      <DeliveryForm />
      <ProductList items={items} setItems={setItems} />
      <OrderSummary items={items} />
      <OrderFormActions onSubmit={submitOrder} />
      
      {orderData && (
        <OrderSuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          orderData={orderData}
        />
      )}
    </div>
  );
}
