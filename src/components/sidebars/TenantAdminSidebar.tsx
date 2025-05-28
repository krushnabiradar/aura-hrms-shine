
import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Users,
  Clock,
  Calendar,
  DollarSign,
  UserPlus,
  BarChart3,
  FileText,
  Settings,
  HelpCircle,
  Home,
  Target,
  TrendingUp,
  Smartphone,
  Key,
  Shield
} from "lucide-react";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/tenant-admin",
    icon: Home,
  },
  {
    title: "Employees",
    href: "/tenant-admin/employees",
    icon: Users,
  },
  {
    title: "Attendance",
    href: "/tenant-admin/attendance",
    icon: Clock,
  },
  {
    title: "Leave Management",
    href: "/tenant-admin/leave",
    icon: Calendar,
  },
  {
    title: "Payroll",
    href: "/tenant-admin/payroll",
    icon: DollarSign,
  },
  {
    title: "Recruitment",
    href: "/tenant-admin/recruitment",
    icon: UserPlus,
  },
  {
    title: "Performance",
    href: "/tenant-admin/performance",
    icon: Target,
  },
  {
    title: "Advanced Analytics",
    href: "/tenant-admin/advanced-analytics",
    icon: TrendingUp,
  },
  {
    title: "Reports",
    href: "/tenant-admin/reports",
    icon: BarChart3,
  },
  {
    title: "Documents",
    href: "/tenant-admin/documents",
    icon: FileText,
  },
  {
    title: "Mobile Support",
    href: "/tenant-admin/mobile-support",
    icon: Smartphone,
  },
  {
    title: "API Integration",
    href: "/tenant-admin/api-integration",
    icon: Key,
  },
  {
    title: "Security",
    href: "/tenant-admin/security",
    icon: Shield,
  },
  {
    title: "Settings",
    href: "/tenant-admin/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    href: "/tenant-admin/help",
    icon: HelpCircle,
  },
];

export function TenantAdminSidebar() {
  const location = useLocation();

  return (
    <div className="pb-12 min-h-screen">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            HR Administration
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                    isActive || location.pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )
                }
              >
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </NavLink>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
