
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';

interface DeliveryFormProps {
  form: UseFormReturn<any>;
}

export function DeliveryForm({ form }: DeliveryFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="oras_livrare"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Oraș Livrare *</FormLabel>
              <FormControl>
                <Input {...field} value={field.value || ''} required />
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
                <Input {...field} value={field.value || ''} />
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
                <Input {...field} value={field.value || ''} />
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
              <Input {...field} value={field.value || ''} required />
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
              <Input {...field} value={field.value || ''} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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
                value={field.value || 0}
                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
