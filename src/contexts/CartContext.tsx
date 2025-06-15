
import React, { createContext, useContext, ReactNode } from 'react';
import type { Tables } from '@/integrations/supabase/types';

type Produs = Tables<'produse'>;

export interface CartItem {
  produs: Produs;
  cantitate: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (produs: Produs, cantitate: number) => void;
  removeFromCart: (produsId: string) => void;
  updateQuantity: (produsId: string, cantitate: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);

  const addToCart = React.useCallback((produs: Produs, cantitate: number) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.produs.id === produs.id);
      if (existingItem) {
        return prev.map(item =>
          item.produs.id === produs.id
            ? { ...item, cantitate: item.cantitate + cantitate }
            : item
        );
      }
      return [...prev, { produs, cantitate }];
    });
  }, []);

  const removeFromCart = React.useCallback((produsId: string) => {
    setCartItems(prev => prev.filter(item => item.produs.id !== produsId));
  }, []);

  const updateQuantity = React.useCallback((produsId: string, cantitate: number) => {
    if (cantitate <= 0) {
      removeFromCart(produsId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.produs.id === produsId
          ? { ...item, cantitate }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = React.useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = React.useCallback(() => {
    return cartItems.reduce((total, item) => total + item.cantitate, 0);
  }, [cartItems]);

  const value = React.useMemo(() => ({
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems
  }), [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
