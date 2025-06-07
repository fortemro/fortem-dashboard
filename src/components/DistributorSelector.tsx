
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface DistributorSelectorProps {
  form: UseFormReturn<any>;
  onDistributorChange: (distributorName: string) => void;
  selectedDistributor: string;
}

export function DistributorSelector({
  form,
  onDistributorChange,
  selectedDistributor
}: DistributorSelectorProps) {
  
  console.log('DistributorSelector - selectedDistributor:', selectedDistributor);

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
                <FormLabel>Nume Distribuitor *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Introduceți numele distribuitorului"
                    value={field.value}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      onDistributorChange(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedDistributor && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm font-medium">
                ✓ Distribuitor introdus: <strong>{selectedDistributor}</strong>
              </p>
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
