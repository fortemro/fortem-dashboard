
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useAdminStats } from '@/hooks/useAdminStats';
import { useComenzi } from '@/hooks/useComenzi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Link } from 'react-router-dom';
import { AdminFilters } from '@/components/admin/AdminFilters';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import { AdminOrdersTable } from '@/components/admin/AdminOrdersTable';
import { AdminMzvTable } from '@/components/admin/AdminMzvTable';
import { AdminDistributorsTable } from '@/components/admin/AdminDistributorsTable';
import { AdminProductsTable } from '@/components/admin/AdminProductsTable';
import { AdminValidationCard } from '@/components/admin/AdminValidationCard';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { comenzi } = useComenzi();
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [selectedMzv, setSelectedMzv] = useState<string>('');
  const [selectedDistributor, setSelectedDistributor] = useState<string>('');
  const [transportatorFilter, setTransportatorFilter] = useState<string>('');

  const { stats, loading } = useAdminStats(dateFrom, dateTo);

  // Verifică dacă utilizatorul este Admin
  if (!profile || profile.rol !== 'Admin') {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Acces Interzis</CardTitle>
            <CardDescription>
              Nu aveți permisiunea de a accesa această pagină. Doar administratorii pot vizualiza dashboard-ul admin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/">
              <Button variant="outline" className="w-full">
                Înapoi la Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtrează comenzile în funcție de criteriile selectate
  const filteredComenzi = comenzi.filter(comanda => {
    if (selectedMzv && comanda.mzv_emitent !== selectedMzv) return false;
    if (selectedDistributor && comanda.distribuitor_id !== selectedDistributor) return false;
    if (dateFrom && comanda.data_comanda < dateFrom) return false;
    if (dateTo && comanda.data_comanda > dateTo) return false;
    if (transportatorFilter && 
        (!comanda.nume_transportator || 
         !comanda.nume_transportator.toLowerCase().includes(transportatorFilter.toLowerCase()))) return false;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrator</h1>
          <p className="text-gray-600 mt-2">
            Vizualizare completă a tuturor comenzilor și statisticilor la nivel de companie
          </p>
        </div>

        <AdminFilters
          dateFrom={dateFrom}
          dateTo={dateTo}
          selectedMzv={selectedMzv}
          selectedDistributor={selectedDistributor}
          transportatorFilter={transportatorFilter}
          stats={stats}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onMzvChange={setSelectedMzv}
          onDistributorChange={setSelectedDistributor}
          onTransportatorChange={setTransportatorFilter}
        />

        <AdminStatsCards
          stats={stats}
          filteredComenzi={filteredComenzi}
          formatCurrency={formatCurrency}
        />

        {/* Tabs pentru diferite vizualizări */}
        <Tabs defaultValue="comenzi" className="space-y-4">
          <TabsList>
            <TabsTrigger value="comenzi">Toate Comenzile</TabsTrigger>
            <TabsTrigger value="mzv">Performanța MZV</TabsTrigger>
            <TabsTrigger value="distribuitori">Distribuitori</TabsTrigger>
            <TabsTrigger value="produse">Produse</TabsTrigger>
          </TabsList>

          <TabsContent value="comenzi">
            <AdminOrdersTable filteredComenzi={filteredComenzi} />
          </TabsContent>

          <TabsContent value="mzv">
            <AdminMzvTable stats={stats} formatCurrency={formatCurrency} />
          </TabsContent>

          <TabsContent value="distribuitori">
            <AdminDistributorsTable stats={stats} formatCurrency={formatCurrency} />
          </TabsContent>

          <TabsContent value="produse">
            <AdminProductsTable stats={stats} formatCurrency={formatCurrency} />
          </TabsContent>
        </Tabs>

        <AdminValidationCard />
      </main>
    </div>
  );
}
