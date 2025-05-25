
import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Menu, User, LogOut, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

interface DashboardLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
}

export function DashboardLayout({ children, sidebar }: DashboardLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/auth");
    } catch (error) {
      toast.error("Error logging out");
    }
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    return "U";
  };

  const getDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) return user.first_name;
    return user?.email || "User";
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-20">
        <div className="flex flex-col flex-grow bg-card border-r h-full overflow-y-auto">
          {sidebar}
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          {sidebar}
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 md:pl-64">
        {/* Top Navigation */}
        <header className="sticky top-0 z-10 bg-background border-b">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-2">
              {/* The SheetTrigger must be placed inside a Sheet component */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSidebarOpen(true)}
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle Menu</span>
                  </Button>
                </SheetTrigger>
              </Sheet>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              
              <NotificationCenter />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar>
                      <AvatarImage src={user?.avatar_url} />
                      <AvatarFallback>
                        {getInitials(user?.first_name, user?.last_name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{getDisplayName()}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {user?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <button className="w-full flex cursor-pointer items-center" onClick={() => toast.info("Profile not implemented yet")}>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </button>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <button className="w-full flex cursor-pointer items-center text-destructive" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">
          <div className="container max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
