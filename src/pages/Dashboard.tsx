
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BarChart3, Users, FileText, Package, UserCircle, ShoppingCart, Shield, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useProduse } from '@/hooks/useProduse';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { useComenzi } from '@/hooks/useComenzi';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { produse } = useProduse();
  const { distribuitori } = useDistribuitori();
  const { comenzi } = useComenzi();

  // Filtrează comenzile pentru MZV (doar cele proprii)
  const mzvComenzi = useMemo(() => {
    if (profile?.rol === 'MZV') {
      return comenzi.filter(comanda => comanda.mzv_emitent === user?.id);
    }
    return comenzi;
  }, [comenzi, profile?.rol, user?.id]);

  // Calculează statisticile pentru MZV
  const mzvStats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const thisMonthOrders = mzvComenzi.filter(comanda => {
      const orderDate = new Date(comanda.data_comanda);
      return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
    });

    // Pentru a calcula valoarea totală, ar trebui să avem access la itemi_comanda
    // Pentru moment, vom afișa doar numărul de comenzi
    const totalValue = 0; // TODO: Calculate from itemi_comanda when available

    return {
      totalOrders: mzvComenzi.length,
      thisMonthOrders: thisMonthOrders.length,
      totalValue,
      recentOrders: mzvComenzi.slice(0, 5)
    };
  }, [mzvComenzi]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bun venit în dashboard-ul Fortem!
          </h2>
          <p className="text-gray-600">
            {profile?.rol === 'Admin' 
              ? 'Dashboard administrativ cu acces complet la toate datele'
              : 'Aici vei putea gestiona comenzile și monitorizarea performanței tale.'
            }
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Distribuitori Activi
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{distribuitori.length}</div>
              <p className="text-xs text-muted-foreground">
                Parteneri disponibili
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Produse Disponibile
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{produse.length}</div>
              <p className="text-xs text-muted-foreground">
                În catalogul nostru
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {profile?.rol === 'MZV' ? 'Comenzile Mele' : 'Total Comenzi'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mzvStats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                {profile?.rol === 'MZV' ? 'Comenzi plasate de mine' : 'Comenzi în sistem'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Luna Aceasta
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mzvStats.thisMonthOrders}</div>
              <p className="text-xs text-muted-foreground">
                Comenzi noi
              </p>
            </CardContent>
          </Card>
        </div>

        {/* MZV Statistics - doar pentru MZV */}
        {profile?.rol === 'MZV' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Comenzile Mele Recente</span>
                <Link to="/comenzile-mele">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Vezi Toate
                  </Button>
                </Link>
              </CardTitle>
              <CardDescription>
                Ultimele 5 comenzi plasate de tine
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mzvStats.recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Număr Comandă</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Oraș Livrare</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Paleti</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mzvStats.recentOrders.map((comanda) => (
                        <TableRow key={comanda.id}>
                          <TableCell className="font-medium">{comanda.numar_comanda}</TableCell>
                          <TableCell>{new Date(comanda.data_comanda).toLocaleDateString('ro-RO')}</TableCell>
                          <TableCell>{comanda.oras_livrare}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              comanda.status === 'Finalizata' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {comanda.status}
                            </span>
                          </TableCell>
                          <TableCell>{comanda.numar_paleti}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Nu ai plasat încă nicio comandă
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Welcome Message */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Sistemul de management Fortem</CardTitle>
              <CardDescription>
                Dashboard-ul Fortem este gata să fie utilizat! Poți începe să explorezi funcționalitățile.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Sistemul de autentificare și baza de date sunt funcționale. Utilizatorii se pot înregistra, 
                autentifica și gestiona profilurile lor cu siguranță.
              </p>
              <div className="space-y-2">
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <UserCircle className="h-4 w-4 mr-2" />
                    {profile ? 'Vizualizează profilul' : 'Completează profilul'}
                  </Button>
                </Link>
                <Link to="/produse">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Explorează produsele
                  </Button>
                </Link>
                <Link to="/comanda">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Creează comandă nouă
                  </Button>
                </Link>
                <Link to="/comenzile-mele">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="h-4 w-4 mr-2" />
                    Comenzile mele
                  </Button>
                </Link>
                {profile?.rol === 'Admin' && (
                  <Link to="/admin-dashboard">
                    <Button variant="outline" className="w-full justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Dashboard Administrator
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {!profile && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="text-orange-800">Completează-ți profilul</CardTitle>
                <CardDescription className="text-orange-600">
                  Pentru o experiență completă, te rugăm să îți completezi profilul.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-orange-700 mb-4">
                  Prin completarea profilului vei putea plasa comenzi și accesa toate funcționalitățile platformei.
                </p>
                <Link to="/profile">
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <UserCircle className="h-4 w-4 mr-2" />
                    Completează acum
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Card special pentru Admin */}
          {profile?.rol === 'Admin' && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Funcții Administrative</CardTitle>
                <CardDescription className="text-blue-600">
                  Acces complet la toate funcționalitățile sistemului
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  Ca administrator, ai acces la dashboard-ul complet cu toate comenzile, 
                  statistici globale și funcții de validare a prețurilor.
                </p>
                <div className="space-y-2">
                  <Link to="/admin-dashboard">
                    <Button className="bg-blue-600 hover:bg-blue-700 w-full">
                      <Shield className="h-4 w-4 mr-2" />
                      Dashboard Administrator
                    </Button>
                  </Link>
                  <Link to="/admin/validare-preturi">
                    <Button variant="outline" className="w-full">
                      Validare Prețuri
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
