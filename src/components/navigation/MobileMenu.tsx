import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Menu,
  Home,
  Package,
  ShoppingCart,
  BarChart3,
  Truck,
  Factory,
  Shield,
  AlertTriangle,
  User,
  LogOut,
} from "lucide-react";
import { useState } from "react";

interface MobileMenuProps {
  user: any;
  profile: any;
  loading: boolean;
  onSignOut: () => void;
}

export default function MobileMenu({ user, profile, loading, onSignOut }: MobileMenuProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
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
              {!loading && profile?.rol === 'admin' && (
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
                    onSignOut();
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
  );
}
