
import { useState } from 'react';
import { useCentralizatorData } from '@/hooks/useCentralizatorData';
import CentralizatorFilters from '@/components/centralizator/CentralizatorFilters';
import OrdersTable from '@/components/centralizator/OrdersTable';

export default function CentralizatorComenzi() {
  const { comenzi, loading, fetchComenziDetaliate } = useCentralizatorData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('toate');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // Filtrează comenzile bazat pe criteriile selectate
  const filteredComenzi = comenzi.filter(comanda => {
    if (searchTerm && !comanda.numar_comanda.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comanda.distribuitor?.nume_companie.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !comanda.oras_livrare.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (statusFilter !== 'toate' && comanda.status !== statusFilter) return false;
    if (dateFrom && comanda.data_comanda < dateFrom) return false;
    if (dateTo && comanda.data_comanda > dateTo) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-sm sm:text-base text-center">Se încarcă datele...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-3 sm:px-4 lg:px-8">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Centralizator Comenzi</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            Vezi toate detaliile comenzilor într-un format centralizat
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <CentralizatorFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            dateFrom={dateFrom}
            setDateFrom={setDateFrom}
            dateTo={dateTo}
            setDateTo={setDateTo}
            onRefresh={fetchComenziDetaliate}
          />

          <OrdersTable comenzi={filteredComenzi} />
        </div>
      </main>
    </div>
  );
}
