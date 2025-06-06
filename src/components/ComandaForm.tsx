
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { useProduse } from '@/hooks/useProduse';
import { useComenzi } from '@/hooks/useComenzi';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Calculator, Loader2 } from 'lucide-react';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
}

export function ComandaForm() {
  const { distribuitori, loading: loadingDistribuitori } = useDistribuitori(true);
  const { createComanda } = useComenzi();
  const { toast } = useToast();
  const [selectedDistribuitor, setSelectedDistribuitor] = useState<string>('');
  const [selectedDistributorData, setSelectedDistributorData] = useState<any>(null);
  const { produse, loading: loadingProduse } = useProduse(selectedDistribuitor);
  const [items, setItems] = useState<ItemComanda[]>([]);

  console.log('ComandaForm - selectedDistribuitor:', selectedDistribuitor);
  console.log('ComandaForm - produse:', produse);
  console.log('ComandaForm - loadingProduse:', loadingProduse);
  console.log('ComandaForm - distribuitori:', distribuitori);

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

  const isAddProductDisabled = !selectedDistribuitor || loadingProduse;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comandă Nouă</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Selectare Distribuitor */}
              <FormField
                control={form.control}
                name="distribuitor_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selectează Distribuitorul *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleDistributorChange(value);
                      }}
                      value={field.value}
                      disabled={loadingDistribuitori}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={loadingDistribuitori ? "Se încarcă distribuitorii..." : "Selectează distribuitorul alocat"} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {distribuitori.map((dist) => (
                          <SelectItem key={dist.id} value={dist.id}>
                            {dist.nume_companie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Pas următor - afișează doar după selectarea distribuitorului */}
              {selectedDistribuitor && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-green-800 text-sm">
                    ✓ Distribuitor selectat: <strong>{selectedDistributorData?.nume_companie}</strong>
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Adresa și datele de contact au fost completate automat mai jos.
                  </p>
                </div>
              )}

              {/* Informații MZV */}
              <FormField
                control={form.control}
                name="mzv_emitent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MZV Emitent</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Numele MZV-ului emitent" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Adresa de livrare - se completează automat */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="oras_livrare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Oraș Livrare *</FormLabel>
                      <FormControl>
                        <Input {...field} required />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="judet_livrare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Județ Livrare</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telefon_livrare"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon Livrare</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="adresa_livrare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adresa Completă Livrare *</FormLabel>
                    <FormControl>
                      <Input {...field} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="observatii"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observații</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Număr Paleți */}
              <FormField
                control={form.control}
                name="numar_paleti"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Număr Paleți</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Secțiunea dinamică pentru produse */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Produse</CardTitle>
                    <div className="flex flex-col items-end space-y-2">
                      <Button 
                        type="button" 
                        onClick={adaugaItem} 
                        disabled={isAddProductDisabled}
                        className="relative"
                      >
                        {loadingProduse ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4 mr-2" />
                        )}
                        Adaugă Produs
                      </Button>
                      
                      {/* Mesaj explicativ când butonul este dezactivat */}
                      {!selectedDistribuitor && (
                        <p className="text-xs text-gray-500 text-right max-w-48">
                          Selectează mai întâi un distribuitor pentru a putea adăuga produse
                        </p>
                      )}
                      
                      {selectedDistribuitor && loadingProduse && (
                        <p className="text-xs text-blue-600 text-right">
                          Se încarcă produsele...
                        </p>
                      )}
                      
                      {selectedDistribuitor && !loadingProduse && produse.length === 0 && (
                        <p className="text-xs text-orange-600 text-right">
                          Nu există produse disponibile pentru acest distribuitor
                        </p>
                      )}
                      
                      {selectedDistribuitor && !loadingProduse && produse.length > 0 && (
                        <p className="text-xs text-green-600 text-right">
                          {produse.length} produse disponibile
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.map((item, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label>Produs *</Label>
                            <Select
                              value={item.produs_id}
                              onValueChange={(value) => updateItem(index, 'produs_id', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selectează produs" />
                              </SelectTrigger>
                              <SelectContent>
                                {produse.map((produs) => (
                                  <SelectItem key={produs.id} value={produs.id}>
                                    {produs.nume}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Cantitate *</Label>
                            <Input
                              type="number"
                              value={item.cantitate}
                              onChange={(e) => updateItem(index, 'cantitate', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>

                          <div>
                            <Label>Preț Vânzare Manual (RON) *</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.pret_unitar}
                              onChange={(e) => updateItem(index, 'pret_unitar', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="font-semibold"
                            />
                          </div>

                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => stergeItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {item.cantitate > 0 && item.pret_unitar > 0 && (
                          <div className="mt-2 p-2 bg-gray-50 rounded">
                            <div className="flex justify-between text-sm">
                              <span>Total produs:</span>
                              <span className="font-semibold">
                                {(item.cantitate * item.pret_unitar).toFixed(2)} RON
                              </span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {items.length > 0 && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Comandă:</span>
                        <span className="text-xl font-bold text-blue-600">
                          {items.reduce((sum, item) => sum + (item.cantitate * item.pret_unitar), 0).toFixed(2)} RON
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => {
                  form.reset();
                  setItems([]);
                  setSelectedDistribuitor('');
                  setSelectedDistributorData(null);
                }}>
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
