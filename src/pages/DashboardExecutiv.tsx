
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, Package, TrendingUp, AlertTriangle } from "lucide-react";

export default function DashboardExecutiv() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Verifică dacă utilizatorul are rolul 'management'
  if (!profile || profile.rol !== 'management') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Executiv</h1>
        <p className="text-gray-600">Raport executiv și indicatori cheie de performanță</p>
      </div>

      {/* Indicatori principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vânzări Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234,567 RON</div>
            <p className="text-xs text-muted-foreground">+12% față de luna trecută</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comenzi Active</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">+5 noi astăzi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribuitori Activi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">+3 noi această lună</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerte Stoc</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">7</div>
            <p className="text-xs text-muted-foreground">Produse cu stoc critic</p>
          </CardContent>
        </Card>
      </div>

      {/* Secțiuni principale */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Performanță Vânzări
            </CardTitle>
            <CardDescription>Evoluția vânzărilor în ultimele 6 luni</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Grafic vânzări - în dezvoltare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Produse</CardTitle>
            <CardDescription>Cele mai vândute produse în această lună</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BCA FORTEM 200</p>
                  <p className="text-sm text-gray-500">234 bucăți</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">89,500 RON</p>
                  <p className="text-sm text-green-600">+15%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BCA FORTEM 150</p>
                  <p className="text-sm text-gray-500">189 bucăți</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">67,200 RON</p>
                  <p className="text-sm text-green-600">+8%</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">BCA FORTEM 250</p>
                  <p className="text-sm text-gray-500">156 bucăți</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">54,800 RON</p>
                  <p className="text-sm text-red-600">-3%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secțiune alertă */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Atenție Necesară
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-orange-700">
            <p>• 7 produse au stocul sub pragul de alertă</p>
            <p>• 3 distribuitori nu au plasat comenzi în ultimele 30 de zile</p>
            <p>• 2 comenzi sunt în întârziere la livrare</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
