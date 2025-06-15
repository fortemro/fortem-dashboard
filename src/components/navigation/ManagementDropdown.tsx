
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  ChevronDown,
  BarChart3,
  Truck,
  Factory,
} from "lucide-react";

export default function ManagementDropdown() {
  return (
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
  );
}
