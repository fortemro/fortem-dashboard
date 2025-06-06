
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useProduse } from '@/hooks/useProduse';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { useComenzi } from '@/hooks/useComenzi';
import { useToast } from '@/hooks/use-toast';
import { Calculator } from 'lucide-react';
import { DistributorSelector } from './DistributorSelector';
import { DeliveryForm } from './DeliveryForm';
import { ProductList } from './ProductList';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function ComandaForm() {
  const { createComanda } = useComenzi();
  const { toast } = useToast();
  const [selectedDistribuitor, setSelectedDistribuitor] = useState<string>('');
  const [selectedDistributorData, setSelectedDistributorData] = useState<any>(null);
  const { distribuitori } = useDistribuitori(true);
  const { produse, loading: loadingProduse } = useProduse(selectedDistribuitor);
  const [items, setItems] = useState<ItemComanda[]>([]);

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
      mzv_emitent: '',
      numar_paleti: 0
    }
  });

  const handleDistributorChange = (distributorId: string) => {
    console.log('handleDistributorChange called with:', distributorId);
    setSelectedDistribuitor(distributorId);
    const distributorData = distribuitori.find(d => d.id === distributorId);
    
    if (distributorData) {
      console.log('Found distributor data:', distributorData);
      setSelectedDistributorData(distributorData);
      // Completează automat câmpurile de adresă și persoană contact
      form.setValue('adresa_livrare', distributorData.adresa);
      form.setValue('oras_livrare', distributorData.oras);
      form.setValue('judet_livrare', distributorData.judet || '');
      form.setValue('telefon_livrare', distributorData.telefon || '');
      
      // Setează persoana de contact în observații
      const observatii = distributorData.persoana_contact 
        ? `Persoană contact: ${distributorData.persoana_contact}`
        : '';
      form.setValue('observatii', observatii);
    }
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

  const onSubmit = async (data: any) => {
    if (items.length === 0) {
      toast({
        title: "Eroare",
        description: "Adaugă cel puțin un produs în comandă",
        variant: "destructive"
      });
      return;
    }

    // Verifică că toate itemii au preț manual introdus
    const itemsWithoutPrice = items.filter(item => !item.pret_unitar || item.pret_unitar <= 0);
    if (itemsWithoutPrice.length > 0) {
      toast({
        title: "Eroare",
        description: "Toate produsele trebuie să aibă un preț de vânzare manual introdus",
        variant: "destructive"
      });
      return;
    }

    try {
      await createComanda(
        {
          ...data,
          numar_paleti: data.numar_paleti || 0
        },
        items.map(item => ({
          produs_id: item.produs_id,
          cantitate: item.cantitate,
          pret_unitar: item.pret_unitar
        }))
      );

      toast({
        title: "Succes",
        description: "Comanda a fost creată cu succes"
      });

      // Reset form
      form.reset();
      setItems([]);
      setSelectedDistribuitor('');
      setSelectedDistributorData(null);
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la crearea comenzii",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    form.reset();
    setItems([]);
    setSelectedDistribuitor('');
    setSelectedDistributorData(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comandă Nouă</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <DistributorSelector
                form={form}
                onDistributorChange={handleDistributorChange}
                selectedDistributor={selectedDistribuitor}
                selectedDistributorData={selectedDistributorData}
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

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Resetează
                </Button>
                <Button type="submit" size="lg" className="bg-green-600 hover:bg-green-700">
                  <Calculator className="h-5 w-5 mr-2" />
                  Trimite Comanda
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
