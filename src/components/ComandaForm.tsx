
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { useProduse } from '@/hooks/useProduse';
import { useCart } from '@/contexts/CartContext';
import { DistributorSelector } from './DistributorSelector';
import { DeliveryForm } from './DeliveryForm';
import { ProductList } from './ProductList';
import { OrderFormActions } from './OrderFormActions';
import { useOrderSubmission } from './OrderSubmissionHandler';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function ComandaForm() {
  const [selectedDistribuitor, setSelectedDistribuitor] = useState<string>('');
  const { produse, loading: loadingProduse } = useProduse();
  const [items, setItems] = useState<ItemComanda[]>([]);
  const { cartItems, clearCart } = useCart();

  console.log('ComandaForm - selectedDistribuitor:', selectedDistribuitor);
  console.log('ComandaForm - produse:', produse);
  console.log('ComandaForm - loadingProduse:', loadingProduse);

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

  // Pre-populate items from cart when component mounts
  useEffect(() => {
    if (cartItems.length > 0 && items.length === 0) {
      const cartToItems = cartItems.map(cartItem => ({
        produs_id: cartItem.produs.id,
        nume_produs: cartItem.produs.nume,
        cantitate: cartItem.cantitate, // Already in paleti from cart
        pret_unitar: 0 // User will need to set the price manually per palet
      }));
      setItems(cartToItems);
    }
  }, [cartItems, items.length]);

  const handleDistributorChange = (distributorName: string) => {
    console.log('handleDistributorChange called with:', distributorName);
    setSelectedDistribuitor(distributorName);
  };

  const adaugaItem = () => {
    console.log('adaugaItem called');
    setItems([...items, {
      produs_id: '',
      nume_produs: '',
      cantitate: 0,
      pret_unitar: 0
    }]);
  };

  const stergeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemComanda, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'produs_id') {
      const selectedProdus = produse.find(p => p.id === value);
      if (selectedProdus) {
        item.nume_produs = selectedProdus.nume;
        console.log('Updated item with product:', selectedProdus);
      }
    }
    
    (item as any)[field] = value;
    setItems(newItems);
  };

  const resetForm = () => {
    form.reset();
    setItems([]);
    setSelectedDistribuitor('');
    clearCart(); // Clear cart when order is successful
  };

  const { submitOrder } = useOrderSubmission({
    produse,
    items,
    onSuccess: resetForm
  });

  const getTotalPaleti = () => {
    return items.reduce((total, item) => total + item.cantitate, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comandă Nouă</CardTitle>
          {cartItems.length > 0 && (
            <p className="text-sm text-blue-600">
              Produse adăugate din catalog: {cartItems.length} articole • {cartItems.reduce((total, item) => total + item.cantitate, 0)} paleti
            </p>
          )}
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitOrder)} className="space-y-6">
              <DistributorSelector
                form={form}
                onDistributorChange={handleDistributorChange}
                selectedDistributor={selectedDistribuitor}
                selectedDistributorData={null}
              />

              <DeliveryForm form={form} />

              <ProductList
                items={items}
                produse={produse}
                loadingProduse={loadingProduse}
                selectedDistribuitor={selectedDistribuitor}
                onAddItem={adaugaItem}
                onUpdateItem={updateItem}
                onDeleteItem={stergeItem}
              />

              {items.length > 0 && (
                <Card className="bg-gray-50">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Total paleti comandați:</span>
                      <span className="font-semibold">{getTotalPaleti()} {getTotalPaleti() === 1 ? 'palet' : 'paleti'}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <OrderFormActions onReset={resetForm} />
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
