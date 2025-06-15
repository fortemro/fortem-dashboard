
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import MobileMenu from "./navigation/MobileMenu";
import DesktopNavigation from "./navigation/DesktopNavigation";
import UserDropdown from "./navigation/UserDropdown";

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
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop Navigation */}
              <DesktopNavigation profile={profile} loading={loading} />

              {/* Mobile Menu Trigger */}
              <MobileMenu 
                user={user} 
                profile={profile} 
                loading={loading} 
                onSignOut={handleSignOut}
              />

              {/* Desktop User Dropdown */}
              <UserDropdown 
                user={user} 
                profile={profile} 
                loading={loading} 
                onSignOut={handleSignOut}
              />
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
