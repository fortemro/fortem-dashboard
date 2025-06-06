
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { LogOut, User, Building2, Package, UserCircle, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link, useLocation } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';

export function Header() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { toast } = useToast();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Deconectare reușită",
      description: "Ai fost deconectat cu succes.",
    });
  };

  // Nu afișa header-ul pe paginile de autentificare
  if (location.pathname === '/auth' || location.pathname === '/') {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600 mr-3" />
            <Link to="/dashboard">
              <h1 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                Dashboard Fortem
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/profile">
              <Button variant="outline" size="sm">
                <UserCircle className="h-4 w-4 mr-2" />
                Profil
              </Button>
            </Link>
            <Link to="/produse">
              <Button variant="outline" size="sm">
                <Package className="h-4 w-4 mr-2" />
                Produse
              </Button>
            </Link>
            <Link to="/comanda">
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Comandă Nouă
              </Button>
            </Link>
            <div className="flex items-center text-sm text-gray-700">
              <User className="h-4 w-4 mr-2" />
              {profile ? `${profile.nume} ${profile.prenume}` : user?.email}
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Deconectare
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
