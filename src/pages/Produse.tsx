
import { useState } from 'react';
import { ProduseGrid } from '@/components/ProduseGrid';
import { Package } from 'lucide-react';

export default function Produse() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Catalog Produse</h1>
          </div>
        </div>

        <ProduseGrid />
      </div>
    </div>
  );
}
