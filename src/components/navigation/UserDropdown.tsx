
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Package,
  ShoppingCart,
  Crown,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";

interface UserDropdownProps {
  user: any;
  profile: any;
  loading: boolean;
  onSignOut: () => void;
}

export default function UserDropdown({ user, profile, loading, onSignOut }: UserDropdownProps) {
  const { isSuperUser } = usePermissions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {profile?.nume?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {isSuperUser() && (
            <div className="absolute -top-1 -right-1">
              <Badge variant="secondary" className="h-4 w-4 p-0 bg-blue-500 text-white rounded-full flex items-center justify-center">
                <Crown className="h-2 w-2" />
              </Badge>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">
                {profile?.nume_complet || 'Utilizator'}
              </p>
              {isSuperUser() && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                  <Crown className="h-3 w-3 mr-1" />
                  Super
                </Badge>
              )}
            </div>
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
        
        {/* Linkuri de bază pentru toate rolurile */}
        <DropdownMenuItem asChild>
          <Link to="/profile">
            <User className="mr-2 h-4 w-4" />
            <span>Profil</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/comenzile-mele">
            <Package className="mr-2 h-4 w-4" />
            <span>Comenzile Mele</span>
          </Link>
        </DropdownMenuItem>

        {/* Links specializate pe rol */}
        {!loading && profile?.rol === 'management' && (
          <DropdownMenuItem asChild>
            <Link to="/dashboard-executiv">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>Dashboard Executiv</span>
            </Link>
          </DropdownMenuItem>
        )}
        
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
        
        {!loading && profile?.rol === 'admin' && (
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
        <DropdownMenuItem onClick={onSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Deconectare</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
