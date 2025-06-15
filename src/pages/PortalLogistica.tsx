import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Truck, Package, MapPin, Clock } from 'lucide-react';
import { ComenziLogisticaTable } from '@/components/logistica/ComenziLogisticaTable';
import { SituatieStocuriTable } from '@/components/logistica/SituatieStocuriTable';
import { useLogisticaStats } from '@/hooks/logistica/useLogisticaStats';

export default function PortalLogistica() {
  const { profile, loading } = useProfile();
  const { stats, loading: statsLoading } = useLogisticaStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verifică dacă utilizatorul are rolul 'logistica' sau 'management'
  if (profile?.rol !== 'logistica' && profile?.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Truck className="h-8 w-8 mr-3 text-blue-600" />
            Portal Logistică
            {profile?.rol === 'management' && (
              <span className="ml-3 px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Acces Management
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            Gestionează și monitorizează operațiunile de logistică
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comenzi în Procesare
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.comenziInProcesare}
              </div>
              <p className="text-xs text-muted-foreground">
                în procesare + pregătite pentru livrare
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Livrări Programate
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.livrariprogramate}
              </div>
              <p className="text-xs text-muted-foreground">
                Pentru astăzi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Rute Active
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.ruteActive}
              </div>
              <p className="text-xs text-muted-foreground">
                Camioane în tranzit cu AWB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eficiență Livrări
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : `${stats.eficientaLivrari}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                Media ultimelor 30 de zile
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabelul principal cu comenzile în așteptare */}
        <div className="mb-8">
          <ComenziLogisticaTable />
        </div>

        {/* Tabelul cu situația stocurilor */}
        <div className="mb-8">
          <SituatieStocuriTable />
        </div>
      </div>
    </div>
  );
}
