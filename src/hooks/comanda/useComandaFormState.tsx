
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export function useComandaFormState() {
  const [selectedDistributorId, setSelectedDistributorId] = useState('');
  const [selectedDistributorName, setSelectedDistributorName] = useState('');
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

  const handleSuccess = (successOrderData: any) => {
    setOrderData(successOrderData);
    setShowSuccessModal(true);
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

  const handleReset = () => {
    form.reset();
    setSelectedDistributorId('');
    setSelectedDistributorName('');
  };

  return {
    form,
    selectedDistributorId,
    selectedDistributorName,
    showSuccessModal,
    orderData,
    setSelectedDistributorId,
    setSelectedDistributorName,
    handleSuccess,
    handleCloseSuccessModal,
    handleDistributorChange,
    handleReset
  };
}
