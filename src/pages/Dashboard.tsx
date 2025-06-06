
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, BarChart3, Users, FileText, Package, UserCircle, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { useProduse } from '@/hooks/useProduse';
import { useDistribuitori } from '@/hooks/useDistribuitori';
import { useComenzi } from '@/hooks/useComenzi';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { produse } = useProduse();
  const { distribuitori } = useDistribuitori();
  const { comenzi } = useComenzi();

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Bun venit în dashboard-ul Fortem!
          </h2>
          <p className="text-gray-600">
            Aici vei putea gestiona toate aspectele organizației tale.
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
                Comenzile Mele
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{comenzi.length}</div>
              <p className="text-xs text-muted-foreground">
                Comenzi plasate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Profil
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile ? '✓' : '!'}</div>
              <p className="text-xs text-muted-foreground">
                {profile ? 'Complet' : 'Incomplet'}
              </p>
            </CardContent>
          </Card>
        </div>

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
        </div>
      </main>
    </div>
  );
}
