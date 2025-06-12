
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { UseFormReturn } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DeliveryFormProps {
  form: UseFormReturn<any>;
}

export function DeliveryForm({ form }: DeliveryFormProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-3 sm:pb-6">
        <CardTitle className="text-lg sm:text-xl">Informații Livrare</CardTitle>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="oras_livrare"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Oraș Livrare *</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      required 
                      className="text-sm sm:text-base"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Județ Livrare</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      className="text-sm sm:text-base"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Telefon Livrare</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      className="text-sm sm:text-base"
                    />
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
                <FormLabel className="text-sm sm:text-base">Adresa Completă Livrare *</FormLabel>
                <FormControl>
                  <Input 
                    {...field} 
                    value={field.value || ''} 
                    required 
                    className="text-sm sm:text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="observatii"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm sm:text-base">Observații</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      value={field.value || ''} 
                      className="text-sm sm:text-base"
                    />
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
                  <FormLabel className="text-sm sm:text-base">Număr Paleți</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      value={field.value || 0}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      className="text-sm sm:text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
