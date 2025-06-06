
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
import { Plus, Trash2, Calculator } from 'lucide-react';

interface ItemComanda {
  produs_id: string;
  nume_produs: string;
  cantitate: number;
  pret_unitar: number;
  nr_paleti?: number;
  ml_comanda?: number;
  bucati_per_palet?: number;
  kg_per_buc?: number;
  dimensiuni?: string;
}

export function ComandaForm() {
  const { distribuitori } = useDistribuitori();
  const { createComanda } = useComenzi();
  const { toast } = useToast();
  const [selectedDistribuitor, setSelectedDistribuitor] = useState<string>('');
  const { produse } = useProduse(selectedDistribuitor);
  const [items, setItems] = useState<ItemComanda[]>([]);

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

  const adaugaItem = () => {
    setItems([...items, {
      produs_id: '',
      nume_produs: '',
      cantitate: 0,
      pret_unitar: 0,
      nr_paleti: 0,
      ml_comanda: 0
    }]);
  };

  const stergeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof ItemComanda, value: any) => {
    const newItems = [...items];
    const item = newItems[index];
    
    // Găsește produsul pentru calculări
    const produs = produse.find(p => p.id === item.produs_id);
    
    if (field === 'produs_id') {
      const selectedProdus = produse.find(p => p.id === value);
      if (selectedProdus) {
        item.nume_produs = selectedProdus.nume;
        item.bucati_per_palet = selectedProdus.bucati_per_palet || 0;
        item.kg_per_buc = selectedProdus.kg_per_buc || 0;
        item.dimensiuni = selectedProdus.dimensiuni || '';
      }
    }
    
    item[field] = value;

    // Calculări automate
    if (produs) {
      if (field === 'nr_paleti' && produs.bucati_per_palet) {
        item.cantitate = value * produs.bucati_per_palet;
      }
      
      if (field === 'cantitate' && produs.bucati_per_palet) {
        item.nr_paleti = Math.ceil(value / produs.bucati_per_palet);
      }
      
      if (field === 'ml_comanda' && produs.dimensiuni) {
        // Calculează bucăți necesare din ml (exemplu simplificat)
        const dimensiuni = produs.dimensiuni.split('X');
        if (dimensiuni.length >= 3) {
          const lungime = parseFloat(dimensiuni[0]) || 0;
          if (lungime > 0) {
            item.cantitate = Math.ceil(value / (lungime / 1000)); // conversie mm la m
          }
        }
      }
    }

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

    // Calculează numărul total de paleți
    const numarPaleti = items.reduce((sum, item) => sum + (item.nr_paleti || 0), 0);

    try {
      await createComanda(
        {
          ...data,
          numar_paleti: numarPaleti
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
    } catch (error) {
      toast({
        title: "Eroare",
        description: "A apărut o eroare la crearea comenzii",
        variant: "destructive"
      });
    }
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
              {/* Informații generale */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distribuitor_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Distribuitor</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedDistribuitor(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selectează distribuitor" />
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

                <FormField
                  control={form.control}
                  name="mzv_emitent"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>MZV Emitent</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Adresa de livrare */}
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

              {/* Produse */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Produse</CardTitle>
                    <Button type="button" onClick={adaugaItem} disabled={!selectedDistribuitor}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adaugă Produs
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {items.map((item, index) => (
                    <Card key={index} className="mb-4">
                      <CardContent className="pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                          <div className="md:col-span-2">
                            <Label>Produs</Label>
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
                            <Label>Nr. Paleți</Label>
                            <Input
                              type="number"
                              value={item.nr_paleti || 0}
                              onChange={(e) => updateItem(index, 'nr_paleti', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Bucăți</Label>
                            <Input
                              type="number"
                              value={item.cantitate}
                              onChange={(e) => updateItem(index, 'cantitate', parseInt(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>ML Comandă</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.ml_comanda || 0}
                              onChange={(e) => updateItem(index, 'ml_comanda', parseFloat(e.target.value) || 0)}
                            />
                          </div>

                          <div>
                            <Label>Preț/Unitate (RON)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={item.pret_unitar}
                              onChange={(e) => updateItem(index, 'pret_unitar', parseFloat(e.target.value) || 0)}
                              placeholder="Preț manual"
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
                      <div className="text-sm text-gray-600 mt-1">
                        Total paleți: {items.reduce((sum, item) => sum + (item.nr_paleti || 0), 0)}
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
                }}>
                  Resetează
                </Button>
                <Button type="submit">
                  <Calculator className="h-4 w-4 mr-2" />
                  Creează Comanda
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
