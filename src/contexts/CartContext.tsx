
import React, { createContext, useContext, useState, ReactNode } from 'react';
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

  const addToCart = (produs: Produs, cantitate: number) => {
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
  };

  const removeFromCart = (produsId: string) => {
    setCartItems(prev => prev.filter(item => item.produs.id !== produsId));
  };

  const updateQuantity = (produsId: string, cantitate: number) => {
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
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.cantitate, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems
    }}>
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
