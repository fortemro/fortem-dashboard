
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { useProduse } from '@/hooks/useProduse';
import { useCart } from '@/contexts/CartContext';
import { useComenzi } from '@/hooks/useComenzi';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function useComandaForm() {
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

  const handleSuccess = (successOrderData: any) => {
    setOrderData(successOrderData);
    setShowSuccessModal(true);
    clearCart();
    setItems([]);
  };

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

  return {
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
  };
}
