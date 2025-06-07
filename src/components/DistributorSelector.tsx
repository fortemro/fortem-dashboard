
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useDistribuitori } from '@/hooks/useDistribuitori';

interface DistributorSelectorProps {
  form: UseFormReturn<any>;
  onDistributorChange: (distributorId: string) => void;
  selectedDistributor: string;
  selectedDistributorData: any;
}

export function DistributorSelector({
  form,
  onDistributorChange,
  selectedDistributor,
  selectedDistributorData
}: DistributorSelectorProps) {
  const { distribuitori, loading: loadingDistribuitori } = useDistribuitori();
  
  console.log('DistributorSelector - selectedDistributor:', selectedDistributor);
  console.log('DistributorSelector - distribuitori:', distribuitori);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuitor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="distribuitor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selectează Distribuitor *</FormLabel>
                <FormControl>
                  <Select
                    disabled={loadingDistribuitori}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      onDistributorChange(value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        loadingDistribuitori 
                          ? "Se încarcă distribuitorii..." 
                          : "Selectează un distribuitor"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {distribuitori.map((distribuitor) => (
                        <SelectItem key={distribuitor.id} value={distribuitor.id}>
                          {distribuitor.nume_companie}
                          {distribuitor.oras && ` - ${distribuitor.oras}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                
                {loadingDistribuitori && (
                  <div className="flex items-center text-sm text-blue-600">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Se încarcă distribuitorii...
                  </div>
                )}
                
                {!loadingDistribuitori && distribuitori.length === 0 && (
                  <p className="text-sm text-orange-600">
                    Nu există distribuitori disponibili în baza de date
                  </p>
                )}
              </FormItem>
            )}
          />

          {selectedDistributorData && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm font-medium">
                ✓ Distribuitor selectat: <strong>{selectedDistributorData.nume_companie}</strong>
              </p>
              {selectedDistributorData.oras && (
                <p className="text-green-600 text-xs mt-1">
                  Localizare: {selectedDistributorData.oras}
                  {selectedDistributorData.judet && `, ${selectedDistributorData.judet}`}
                </p>
              )}
              {selectedDistributorData.persoana_contact && (
                <p className="text-green-600 text-xs">
                  Contact: {selectedDistributorData.persoana_contact}
                  {selectedDistributorData.telefon && ` - ${selectedDistributorData.telefon}`}
                </p>
              )}
              <p className="text-green-600 text-xs mt-2">
                Puteți continua să completați restul formularului.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
