
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';
import { Truck, Package, MapPin, Clock, AlertTriangle, Users, XCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ComenziLogisticaTable } from '@/components/logistica/ComenziLogisticaTable';
import { SituatieStocuriTable } from '@/components/logistica/SituatieStocuriTable';
import { ComenziAnulateTable } from '@/components/shared/ComenziAnulateTable';
import { useLogisticaStats } from '@/hooks/logistica/useLogisticaStats';
import { useComenziAnulateGlobal } from '@/hooks/useComenziAnulateGlobal';

export default function PortalLogistica() {
  const { profile, loading } = useProfile();
  const { stats, loading: statsLoading } = useLogisticaStats();
  const { comenziAnulate, loading: loadingAnulate } = useComenziAnulateGlobal();

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
                în așteptare + în procesare
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Transport Alocat
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.comenziCuTransportAlocat}
              </div>
              <p className="text-xs text-muted-foreground">
                comenzi cu transportator și mașină
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Expediate Astăzi
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {statsLoading ? '...' : stats.comenziExpediateAstazi}
              </div>
              <p className="text-xs text-muted-foreground">
                expediate în ziua curentă
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Comenzi Anulate
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {loadingAnulate ? '...' : comenziAnulate.length}
              </div>
              <p className="text-xs text-muted-foreground">
                comenzi anulate total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs pentru comenzi active, stocuri și comenzi anulate */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Comenzi Active
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Situație Stocuri
            </TabsTrigger>
            <TabsTrigger value="cancelled" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Comenzi Anulate ({comenziAnulate.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="mt-6">
            <ComenziLogisticaTable />
          </TabsContent>
          
          <TabsContent value="stocks" className="mt-6">
            <SituatieStocuriTable />
          </TabsContent>
          
          <TabsContent value="cancelled" className="mt-6">
            <ComenziAnulateTable
              comenziAnulate={comenziAnulate}
              loading={loadingAnulate}
              showUserColumn={true}
              title="Comenzi Anulate - Portal Logistică"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
