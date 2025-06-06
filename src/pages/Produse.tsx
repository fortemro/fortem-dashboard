
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProduseGrid } from '@/components/ProduseGrid';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { Package } from 'lucide-react';

export default function Produse() {
  const { distribuitori } = useDistribuitori();
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Catalog Produse</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Explorează produsele disponibile de la distribuitorii noștri
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={selectedDistributor} onValueChange={setSelectedDistributor}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Filtrează după distribuitor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Toți distribuitorii</SelectItem>
                {distribuitori.map((distribuitor) => (
                  <SelectItem key={distribuitor.id} value={distribuitor.id}>
                    {distribuitor.nume_companie}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ProduseGrid distributorId={selectedDistributor || undefined} />
      </div>
    </div>
  );
}
