
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  LogOut,
  User,
  Shield,
  AlertTriangle,
  Truck,
  Factory,
  BarChart3,
  ChevronDown,
  Settings,
} from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();

  const handleSignOut = async () => {
    await signOut();
  };

  // Debug log pentru a vedea datele profilului
  console.log('Header - Profile data:', profile);
  console.log('Header - Profile loading:', loading);
  console.log('Header - Profile rol:', profile?.rol);

  return (
    <header className="bg-white shadow-sm border-b fixed top-0 w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <img 
                src="/lovable-uploads/ac892f66-9d8d-428d-8556-7253923055ff.png" 
                alt="Fortem Logo" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {user ? (
            <div className="flex items-center space-x-4">
              <nav className="hidden md:flex space-x-4">
                <Link
                  to="/"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to="/produse"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Produse
                </Link>
                <Link
                  to="/comanda"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Comandă Nouă
                </Link>
                
                {/* Portal Management Dropdown pentru utilizatorii cu rolul management */}
                {!loading && profile?.rol === 'management' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        Portal Management
                        <ChevronDown className="h-4 w-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white" align="start" forceMount>
                      <DropdownMenuItem asChild>
                        <Link to="/dashboard-executiv" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Dashboard Executiv</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/panou-vanzari" className="flex items-center">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Panou Vânzări (General)</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/portal-logistica" className="flex items-center">
                          <Truck className="mr-2 h-4 w-4" />
                          <span>Portal Logistica</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/productie" className="flex items-center">
                          <Factory className="mr-2 h-4 w-4" />
                          <span>Portal Producție</span>
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Link pentru utilizatori cu rolul management (păstrat pentru compatibilitate) */}
                {!loading && profile?.rol === 'management' && (
                  <Link
                    to="/dashboard-executiv"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Dashboard Executiv
                  </Link>
                )}
                {/* Link doar pentru utilizatori cu rolul productie */}
                {!loading && profile?.rol === 'productie' && (
                  <Link
                    to="/productie"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Factory className="h-4 w-4 mr-1" />
                    Producție
                  </Link>
                )}
                {!loading && profile?.rol === 'logistica' && (
                  <Link
                    to="/portal-logistica"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <Truck className="h-4 w-4 mr-1" />
                    Portal Logistică
                  </Link>
                )}
                {!loading && profile?.rol === 'Admin' && (
                  <>
                    <Link
                      to="/admin-dashboard"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Admin Dashboard
                    </Link>
                    <Link
                      to="/admin/validare-preturi"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Validare Prețuri
                    </Link>
                  </>
                )}
              </nav>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {profile?.nume?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.nume_complet || 'Utilizator'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                      {profile?.rol && (
                        <p className="text-xs leading-none text-muted-foreground">
                          Rol: {profile.rol}
                        </p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  {/* Link dropdown Dashboard Executiv doar pt rol management */}
                  {!loading && profile?.rol === 'management' && (
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard-executiv">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        <span>Dashboard Executiv</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {/* Link dropdown Producție doar pt rol productie */}
                  {!loading && profile?.rol === 'productie' && (
                    <DropdownMenuItem asChild>
                      <Link to="/productie">
                        <Factory className="mr-2 h-4 w-4" />
                        <span>Producție</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!loading && profile?.rol === 'logistica' && (
                    <DropdownMenuItem asChild>
                      <Link to="/portal-logistica">
                        <Truck className="mr-2 h-4 w-4" />
                        <span>Portal Logistică</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {!loading && profile?.rol === 'Admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin-dashboard">
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/validare-preturi">
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          <span>Validare Prețuri</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Deconectare</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Link to="/auth">
              <Button>Autentificare</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
