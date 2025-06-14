
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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  Menu,
  Home,
  Package,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";

export default function Header() {
  const { user, signOut } = useAuth();
  const { profile, loading } = useProfile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  // Debug log pentru a vedea datele profilului
  console.log('Header - Profile data:', profile);
  console.log('Header - Profile loading:', loading);
  console.log('Header - Profile rol:', profile?.rol);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation */}
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

              {/* Mobile Menu Trigger */}
              <div className="md:hidden">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Menu className="h-5 w-5" />
                      <span className="sr-only">Deschide meniul</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-0">
                    <div className="flex flex-col h-full">
                      <div className="p-4 border-b">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback>
                              {profile?.nume?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium leading-none truncate">
                              {profile?.nume_complet || 'Utilizator'}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.email}
                            </p>
                            {profile?.rol && (
                              <p className="text-xs text-muted-foreground">
                                Rol: {profile.rol}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <nav className="flex-1 p-4 space-y-2">
                        <Link
                          to="/"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Home className="h-5 w-5" />
                          <span>Dashboard</span>
                        </Link>
                        
                        <Link
                          to="/produse"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <Package className="h-5 w-5" />
                          <span>Produse</span>
                        </Link>
                        
                        <Link
                          to="/comanda"
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                          onClick={closeMobileMenu}
                        >
                          <ShoppingCart className="h-5 w-5" />
                          <span>Comandă Nouă</span>
                        </Link>

                        {/* Portal Management pentru rolul management */}
                        {!loading && profile?.rol === 'management' && (
                          <>
                            <div className="pt-2">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
                                Portal Management
                              </div>
                              <Link
                                to="/dashboard-executiv"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <BarChart3 className="h-5 w-5" />
                                <span>Dashboard Executiv</span>
                              </Link>
                              <Link
                                to="/panou-vanzari"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <BarChart3 className="h-5 w-5" />
                                <span>Panou Vânzări (General)</span>
                              </Link>
                              <Link
                                to="/portal-logistica"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <Truck className="h-5 w-5" />
                                <span>Portal Logistica</span>
                              </Link>
                              <Link
                                to="/productie"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <Factory className="h-5 w-5" />
                                <span>Portal Producție</span>
                              </Link>
                            </div>
                          </>
                        )}

                        {/* Link pentru utilizatori cu rolul productie */}
                        {!loading && profile?.rol === 'productie' && (
                          <Link
                            to="/productie"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={closeMobileMenu}
                          >
                            <Factory className="h-5 w-5" />
                            <span>Producție</span>
                          </Link>
                        )}

                        {/* Link pentru utilizatori cu rolul logistica */}
                        {!loading && profile?.rol === 'logistica' && (
                          <Link
                            to="/portal-logistica"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={closeMobileMenu}
                          >
                            <Truck className="h-5 w-5" />
                            <span>Portal Logistică</span>
                          </Link>
                        )}

                        {/* Links pentru Admin */}
                        {!loading && profile?.rol === 'Admin' && (
                          <>
                            <div className="pt-2">
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
                                Administrare
                              </div>
                              <Link
                                to="/admin-dashboard"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <Shield className="h-5 w-5" />
                                <span>Admin Dashboard</span>
                              </Link>
                              <Link
                                to="/admin/validare-preturi"
                                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                                onClick={closeMobileMenu}
                              >
                                <AlertTriangle className="h-5 w-5" />
                                <span>Validare Prețuri</span>
                              </Link>
                            </div>
                          </>
                        )}

                        <div className="pt-4 border-t">
                          <Link
                            to="/profile"
                            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={closeMobileMenu}
                          >
                            <User className="h-5 w-5" />
                            <span>Profil</span>
                          </Link>
                          
                          <button
                            onClick={() => {
                              handleSignOut();
                              closeMobileMenu();
                            }}
                            className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-100 transition-colors text-left"
                          >
                            <LogOut className="h-5 w-5" />
                            <span>Deconectare</span>
                          </button>
                        </div>
                      </nav>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop User Dropdown */}
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
