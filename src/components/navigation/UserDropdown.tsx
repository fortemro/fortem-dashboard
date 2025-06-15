import { Link } from "react-router-dom";
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
} from "lucide-react";

interface UserDropdownProps {
  user: any;
  profile: any;
  loading: boolean;
  onSignOut: () => void;
}

export default function UserDropdown({ user, profile, loading, onSignOut }: UserDropdownProps) {
  return (
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
