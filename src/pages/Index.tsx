
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building, Users, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [hasRedirected, setHasRedirected] = useState(false);

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    console.log('Index useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);
    
    // Prevent multiple redirects
    if (hasRedirected) return;
    
    if (!isLoading) {
      if (isAuthenticated && user) {
        if (user.role) {
          console.log('Redirecting user with role:', user.role);
          setHasRedirected(true);
          switch (user.role) {
            case "system_admin":
              console.log('Navigating to system-admin dashboard');
              navigate("/system-admin", { replace: true });
              break;
            case "tenant_admin":
              console.log('Navigating to tenant-admin dashboard');
              navigate("/tenant-admin", { replace: true });
              break;
            case "employee":
              console.log('Navigating to employee dashboard');
              navigate("/ess", { replace: true });
              break;
            default:
              console.warn('Unknown user role:', user.role);
              navigate("/ess", { replace: true }); // Default to employee dashboard
              break;
          }
        } else {
          console.log('User authenticated but no role found, defaulting to employee dashboard');
          setHasRedirected(true);
          navigate("/ess", { replace: true });
        }
      } else {
        // If not authenticated, redirect to landing page
        console.log('User not authenticated, redirecting to landing');
        setHasRedirected(true);
        navigate("/landing", { replace: true });
      }
    }
  }, [isAuthenticated, user, isLoading, navigate, hasRedirected]);

  // Show a loading state while checking authentication
  if (isLoading && !hasRedirected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  );
};

export default Index;
