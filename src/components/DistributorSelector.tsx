
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { UseFormReturn } from 'react-hook-form';

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
  const { distribuitori, loading: loadingDistribuitori } = useDistribuitori(true);

  console.log('DistributorSelector - distribuitori:', distribuitori);

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="distribuitor_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Selectează Distribuitorul *</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                onDistributorChange(value);
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
    </div>
  );
}
