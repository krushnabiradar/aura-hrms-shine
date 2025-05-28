
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Clock,
  Calendar,
  DollarSign,
  Briefcase,
  Settings,
  BarChart3,
  FileText,
  HelpCircle
} from "lucide-react";

export function TenantAdminSidebar() {
  const { pathname } = useLocation();

  const links = [
    { href: "/tenant-admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/tenant-admin/employees", icon: Users, label: "Employees" },
    { href: "/tenant-admin/attendance", icon: Clock, label: "Attendance" },
    { href: "/tenant-admin/leave", icon: Calendar, label: "Leave Management" },
    { href: "/tenant-admin/payroll", icon: DollarSign, label: "Payroll" },
    { href: "/tenant-admin/recruitment", icon: Briefcase, label: "Recruitment" },
    { href: "/tenant-admin/reports", icon: BarChart3, label: "Reports" },
    { href: "/tenant-admin/documents", icon: FileText, label: "Documents" },
    { href: "/tenant-admin/settings", icon: Settings, label: "Settings" },
    { href: "/tenant-admin/help", icon: HelpCircle, label: "Help & Support" }
  ];

  return (
    <div className="flex flex-col min-h-full py-4">
      <div className="px-4 mb-8">
        <Link to="/tenant-admin" className="flex items-center gap-2">
          <span className="text-xl font-bold text-accent">Aura</span>
          <span className="text-xl font-bold">HRMS</span>
        </Link>
        <div className="mt-2 text-sm text-muted-foreground">HR Administration</div>
      </div>
      
      <div className="flex-1">
        <nav className="flex flex-col gap-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === link.href ? "bg-accent/10 text-accent font-medium" : "text-muted-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-4 mt-auto pt-6 border-t text-sm text-muted-foreground">
        <p>Acme Corporation</p>
        <p>Tenant Admin Panel</p>
      </div>
    </div>
  );
}
