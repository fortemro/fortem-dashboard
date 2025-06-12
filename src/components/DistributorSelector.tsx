
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UseFormReturn } from 'react-hook-form';

interface DistributorSelectorProps {
  form: UseFormReturn<any>;
  onDistributorChange: (distributorId: string, distributorName: string) => void;
  selectedDistributor: string;
}

export function DistributorSelector({
  form,
  onDistributorChange,
  selectedDistributor
}: DistributorSelectorProps) {

  const handleDistributorNameChange = (name: string) => {
    form.setValue('distribuitor_id', name);
    onDistributorChange(name, name);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Distribuitor</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="distribuitor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm sm:text-base">Nume Distribuitor *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Introduceți numele distribuitorului"
                    value={field.value}
                    onChange={(e) => handleDistributorNameChange(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {selectedDistributor && (
            <div className="p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm font-medium break-words">
                ✓ Distribuitor: <strong>{selectedDistributor}</strong>
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
