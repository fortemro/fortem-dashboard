
import { useState, useEffect, useCallback } from 'react';
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

  // Stable function to load order for editing
  const loadOrderForEditing = useCallback(async () => {
    if (!isEditMode || !editId) {
      setLoadingOrder(false);
      return;
    }

    console.log('Loading order for editing:', editId);
    setLoadingOrder(true);
    
    try {
      const orderData = await getComandaById(editId);
      console.log('Order data loaded:', orderData);

      if (!orderData) {
        console.error('No order data found for id:', editId);
        setLoadingOrder(false);
        return;
      }

      // Pre-fill form with order data - using correct property names
      const distributorName = orderData.distribuitori?.nume_companie || orderData.distribuitor_id || '';
      
      const formData = {
        distribuitor_id: distributorName,
        oras_livrare: orderData.oras_livrare || '',
        adresa_livrare: orderData.adresa_livrare || '',
        judet_livrare: orderData.judet_livrare || '',
        telefon_livrare: orderData.telefon_livrare || '',
        observatii: orderData.observatii || ''
      };
      
      console.log('Setting form data:', formData);
      form.reset(formData);
      
      // Set distributor data properly
      setSelectedDistributorId(distributorName);
      setSelectedDistributorName(distributorName);

      // Pre-fill items - checking if items exist from the hook
      if (orderData.items && Array.isArray(orderData.items)) {
        const orderItems = orderData.items.map((item: any) => ({
          produs_id: item.produs?.id || item.produs_id,
          nume_produs: item.produs?.nume || 'Produs necunoscut',
          cantitate: item.cantitate || 0,
          pret_unitar: item.pret_unitar || 0
        }));
        console.log('Setting items:', orderItems);
        setItems(orderItems);
      }

      console.log('Order loading completed successfully');
    } catch (error) {
      console.error('Error loading order for editing:', error);
    } finally {
      setLoadingOrder(false);
    }
  }, [isEditMode, editId, getComandaById, form]);

  // Load order data when in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadOrderForEditing();
    }
  }, [isEditMode, editId, loadOrderForEditing]);

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

  // Check for duplicate order data on mount - doar când nu suntem în edit mode
  useEffect(() => {
    if (!isEditMode) {
      const duplicateData = localStorage.getItem('duplicateOrderData');
      
      if (duplicateData) {
        try {
          const parsedData = JSON.parse(duplicateData);
          console.log('Loading duplicate order data:', parsedData);
          
          const distributorToUse = parsedData.distribuitor_name || parsedData.distribuitor_id;
          if (distributorToUse) {
            form.setValue('distribuitor_id', distributorToUse);
            setSelectedDistributorId(distributorToUse);
            setSelectedDistributorName(distributorToUse);
          }
          if (parsedData.oras_livrare) form.setValue('oras_livrare', parsedData.oras_livrare);
          if (parsedData.adresa_livrare) form.setValue('adresa_livrare', parsedData.adresa_livrare);
          if (parsedData.judet_livrare) form.setValue('judet_livrare', parsedData.judet_livrare);
          if (parsedData.telefon_livrare) form.setValue('telefon_livrare', parsedData.telefon_livrare);
          if (parsedData.observatii) form.setValue('observatii', parsedData.observatii);
          
          if (parsedData.items && Array.isArray(parsedData.items)) {
            const validItems = parsedData.items.filter(item => 
              item.produs_id && item.nume_produs && 
              typeof item.cantitate === 'number' && 
              typeof item.pret_unitar === 'number'
            );
            if (validItems.length > 0) {
              setItems(validItems);
            }
          }
          
          localStorage.removeItem('duplicateOrderData');
        } catch (error) {
          console.error('Error parsing duplicate order data:', error);
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
