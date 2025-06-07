
import React, { useState, useEffect } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { useDistribuitori } from '@/hooks/useDistribuitori';

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
  const { distribuitori, loading } = useDistribuitori();
  const [showNewDistributorForm, setShowNewDistributorForm] = useState(false);
  const [newDistributorName, setNewDistributorName] = useState('');

  console.log('DistributorSelector - selectedDistributor:', selectedDistributor);
  console.log('DistributorSelector - distribuitori:', distribuitori);

  const handleDistributorSelect = (distributorId: string) => {
    const distribuitor = distribuitori.find(d => d.id === distributorId);
    if (distribuitor) {
      form.setValue('distribuitor_id', distributorId);
      onDistributorChange(distributorId, distribuitor.nume_companie);
    }
  };

  const handleNewDistributorSubmit = () => {
    if (newDistributorName.trim()) {
      // Setăm numele noului distribuitor ca ID temporar
      // Logica din useComenzi va crea distribuitor-ul real
      form.setValue('distribuitor_id', newDistributorName.trim());
      onDistributorChange(newDistributorName.trim(), newDistributorName.trim());
      setShowNewDistributorForm(false);
      setNewDistributorName('');
    }
  };

  const selectedDistributorName = distribuitori.find(d => d.id === selectedDistributor)?.nume_companie || selectedDistributor;

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
                <FormLabel>Distribuitor *</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Select 
                      value={field.value} 
                      onValueChange={handleDistributorSelect}
                      disabled={loading}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={loading ? "Se încarcă..." : "Selectează un distribuitor"} />
                      </SelectTrigger>
                      <SelectContent>
                        {distribuitori.map((distribuitor) => (
                          <SelectItem key={distribuitor.id} value={distribuitor.id}>
                            {distribuitor.nume_companie}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowNewDistributorForm(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {showNewDistributorForm && (
            <div className="p-4 border rounded-lg bg-gray-50">
              <h4 className="font-medium mb-2">Distribuitor Nou</h4>
              <div className="flex gap-2">
                <Input
                  placeholder="Nume companie"
                  value={newDistributorName}
                  onChange={(e) => setNewDistributorName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewDistributorSubmit()}
                />
                <Button 
                  type="button" 
                  onClick={handleNewDistributorSubmit}
                  disabled={!newDistributorName.trim()}
                >
                  Adaugă
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowNewDistributorForm(false);
                    setNewDistributorName('');
                  }}
                >
                  Anulează
                </Button>
              </div>
            </div>
          )}

          {selectedDistributor && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-green-800 text-sm font-medium">
                ✓ Distribuitor selectat: <strong>{selectedDistributorName}</strong>
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
