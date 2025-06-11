
import { useState, useEffect } from 'react';
import { useCart } from '@/contexts/CartContext';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function useItemsManager(isEditMode: boolean) {
  const [items, setItems] = useState<ItemComanda[]>([]);
  const { cartItems, clearCart } = useCart();

  // Initialize items from cart - doar când nu suntem în edit mode
  useEffect(() => {
    if (cartItems.length > 0 && !isEditMode) {
      const cartBasedItems = cartItems.map(cartItem => ({
        produs_id: cartItem.produs.id,
        nume_produs: cartItem.produs.nume,
        cantitate: cartItem.cantitate,
        pret_unitar: 0
      }));
      setItems(cartBasedItems);
    }
  }, [cartItems, isEditMode]);

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

  return {
    items,
    setItems,
    clearCart,
    handleAddItem,
    handleUpdateItem,
    handleDeleteItem
  };
}
