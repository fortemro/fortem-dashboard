
import { useProfile } from "@/hooks/useProfile";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Package, TrendingUp, AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";

type PeriodFilter = 'today' | 'yesterday' | 'last7days' | 'thisMonth';

const periodOptions: { value: PeriodFilter; label: string }[] = [
  { value: 'today', label: 'Astăzi' },
  { value: 'yesterday', label: 'Ieri' },
  { value: 'last7days', label: 'Ultimele 7 Zile' },
  { value: 'thisMonth', label: 'Luna Aceasta' },
];

export default function DashboardExecutiv() {
  const { profile, loading } = useProfile();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodFilter>('today');

  // Simulare date diferite pentru fiecare perioadă
  const getDataForPeriod = (period: PeriodFilter) => {
    switch (period) {
      case 'today':
        return {
          vanzariTotale: '45,678 RON',
          vanzariChange: '+5%',
          comenziActive: 12,
          comenziChange: '+2 noi',
          distributoriActivi: 8,
          distributoriChange: 'activi azi',
          alerteStoc: 3,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '23 bucăți', valoare: '8,950 RON', trend: '+12%' },
            { nume: 'BCA FORTEM 150', cantitate: '18 bucăți', valoare: '6,720 RON', trend: '+8%' },
            { nume: 'BCA FORTEM 250', cantitate: '15 bucăți', valoare: '5,480 RON', trend: '-2%' },
          ]
        };
      case 'yesterday':
        return {
          vanzariTotale: '52,340 RON',
          vanzariChange: '+8%',
          comenziActive: 15,
          comenziChange: '+3 noi',
          distributoriActivi: 12,
          distributoriChange: 'activi ieri',
          alerteStoc: 5,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 150', cantitate: '28 bucăți', valoare: '10,440 RON', trend: '+15%' },
            { nume: 'BCA FORTEM 200', cantitate: '25 bucăți', valoare: '9,750 RON', trend: '+10%' },
            { nume: 'BCA FORTEM 100', cantitate: '20 bucăți', valoare: '7,200 RON', trend: '+5%' },
          ]
        };
      case 'last7days':
        return {
          vanzariTotale: '324,567 RON',
          vanzariChange: '+12%',
          comenziActive: 89,
          comenziChange: '+15 această săptămână',
          distributoriActivi: 45,
          distributoriChange: 'activi săptămâna aceasta',
          alerteStoc: 7,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '180 bucăți', valoare: '68,400 RON', trend: '+18%' },
            { nume: 'BCA FORTEM 150', cantitate: '145 bucăți', valoare: '54,150 RON', trend: '+14%' },
            { nume: 'BCA FORTEM 250', cantitate: '120 bucăți', valoare: '43,200 RON', trend: '+8%' },
          ]
        };
      case 'thisMonth':
        return {
          vanzariTotale: '1,234,567 RON',
          vanzariChange: '+12%',
          comenziActive: 89,
          comenziChange: '+25 această lună',
          distributoriActivi: 156,
          distributoriChange: 'activi luna aceasta',
          alerteStoc: 7,
          alerteChange: 'produse critice',
          topProduse: [
            { nume: 'BCA FORTEM 200', cantitate: '734 bucăți', valoare: '278,580 RON', trend: '+15%' },
            { nume: 'BCA FORTEM 150', cantitate: '589 bucăți', valoare: '219,780 RON', trend: '+8%' },
            { nume: 'BCA FORTEM 250', cantitate: '456 bucăți', valoare: '164,160 RON', trend: '-3%' },
          ]
        };
      default:
        return getDataForPeriod('today');
    }
  };

  const currentData = getDataForPeriod(selectedPeriod);

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

      {/* Filtru de perioadă */}
      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-blue-800 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Perioada Analizată
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={selectedPeriod === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(option.value)}
                className={selectedPeriod === option.value ? "bg-blue-600 hover:bg-blue-700" : ""}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Indicatori principali */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vânzări Totale</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.vanzariTotale}</div>
            <p className="text-xs text-muted-foreground">{currentData.vanzariChange} față de perioada anterioară</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comenzi Active</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.comenziActive}</div>
            <p className="text-xs text-muted-foreground">{currentData.comenziChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distribuitori Activi</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentData.distributoriActivi}</div>
            <p className="text-xs text-muted-foreground">{currentData.distributoriChange}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alerte Stoc</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{currentData.alerteStoc}</div>
            <p className="text-xs text-muted-foreground">{currentData.alerteChange}</p>
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
            <CardDescription>Evoluția vânzărilor pentru perioada selectată</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded">
              <div className="text-center text-gray-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Grafic vânzări pentru {periodOptions.find(p => p.value === selectedPeriod)?.label}</p>
                <p className="text-sm">în dezvoltare</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Produse</CardTitle>
            <CardDescription>Cele mai vândute produse în perioada selectată</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentData.topProduse.map((produs, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{produs.nume}</p>
                    <p className="text-sm text-gray-500">{produs.cantitate}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{produs.valoare}</p>
                    <p className={`text-sm ${produs.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                      {produs.trend}
                    </p>
                  </div>
                </div>
              ))}
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
            <p>• {currentData.alerteStoc} produse au stocul sub pragul de alertă</p>
            <p>• 3 distribuitori nu au plasat comenzi în perioada selectată</p>
            <p>• 2 comenzi sunt în întârziere la livrare</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
