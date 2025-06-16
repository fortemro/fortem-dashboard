
import { Link } from "react-router-dom";
import ManagementDropdown from "./ManagementDropdown";
import { Factory, Truck } from "lucide-react";

interface DesktopNavigationProps {
  profile: any;
  loading: boolean;
}

export default function DesktopNavigation({ profile, loading }: DesktopNavigationProps) {
  return (
    <nav className="hidden md:flex space-x-4">
      <Link
        to="/"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
      >
        Dashboard
      </Link>
      
      {/* Linkurile de bază accesibile tuturor rolurilor */}
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
        <ManagementDropdown />
      )}

      {/* Links specifice pentru roluri specializate */}
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
      {!loading && profile?.rol === 'admin' && (
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
  );
}
