
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Building, Users, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const Index = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();

  // If user is already logged in, redirect to their dashboard
  useEffect(() => {
    console.log('Index useEffect - isAuthenticated:', isAuthenticated, 'user:', user, 'isLoading:', isLoading);
    
    if (!isLoading && isAuthenticated) {
      if (user) {
        console.log('Redirecting user with role:', user.role);
        switch (user.role) {
          case "system_admin":
            navigate("/system-admin");
            break;
          case "tenant_admin":
            navigate("/tenant-admin");
            break;
          case "employee":
            navigate("/ess");
            break;
          default:
            console.warn('Unknown user role:', user.role);
            navigate("/ess"); // Default to employee dashboard
            break;
        }
      } else {
        console.log('User authenticated but no profile found, redirecting to auth');
        navigate("/auth");
      }
    } else if (!isLoading && !isAuthenticated) {
      // If not authenticated, redirect to landing page
      console.log('User not authenticated, redirecting to landing');
      navigate("/landing");
    }
  }, [isAuthenticated, user, isLoading, navigate]);

  // Show a loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show a minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    </div>
  );
};

export default Index;
