import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { EmployeeSidebar } from "@/components/sidebars/EmployeeSidebar";

// Import all the ESS pages
import ProfilePage from "./ProfilePage";
import AttendancePage from "./AttendancePage";
import LeavePage from "./LeavePage";
import DocumentsPage from "./DocumentsPage";
import PayslipsPage from "./PayslipsPage";

// Import the original dashboard content
import {
  Calendar,
  Clock,
  FileText,
  Users,
  MessageSquare,
  CreditCard,
  Award,
  Briefcase
} from "lucide-react";

import { DashboardCard } from "@/components/dashboard/DashboardCard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const EmployeeDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  
  // Simulating data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Route to different pages based on URL
  const renderPageContent = () => {
    switch (location.pathname) {
      case '/ess/profile':
        return <ProfilePage />;
      case '/ess/attendance':
        return <AttendancePage />;
      case '/ess/leave':
        return <LeavePage />;
      case '/ess/documents':
        return <DocumentsPage />;
      case '/ess/payslips':
        return <PayslipsPage />;
      case '/ess/performance':
        return <div className="text-center py-8"><h2 className="text-2xl">Performance page coming soon...</h2></div>;
      case '/ess/help':
        return <div className="text-center py-8"><h2 className="text-2xl">Help page coming soon...</h2></div>;
      case '/ess/settings':
        return <div className="text-center py-8"><h2 className="text-2xl">Settings page coming soon...</h2></div>;
      default:
        return renderDashboardHome();
    }
  };

  const getUserDisplayName = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user?.first_name) {
      return user.first_name;
    }
    return 'User';
  };

  const renderDashboardHome = () => (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Dashboard</h2>
        <p className="text-muted-foreground">Welcome back, {getUserDisplayName()}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardCard
          title="Available Leave"
          value={isLoading ? "Loading..." : "12 days"}
          icon={Calendar}
          description="Annual leave balance"
        />
        <DashboardCard
          title="Working Hours"
          value={isLoading ? "Loading..." : "32h / 40h"}
          icon={Clock}
          description="This week"
        />
        <DashboardCard
          title="Pending Tasks"
          value={isLoading ? "Loading..." : "5"}
          icon={FileText}
          description="Due this week"
        />
        <DashboardCard
          title="Team Members"
          value={isLoading ? "Loading..." : "8"}
          icon={Users}
          description="In your department"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can perform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
                onClick={() => toast.info("Leave request form will open here")}
              >
                <Calendar className="h-5 w-5" />
                <span>Request Leave</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
                onClick={() => toast.info("Timesheet form will open here")}
              >
                <Clock className="h-5 w-5" />
                <span>Log Time</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
                onClick={() => toast.info("Support form will open here")}
              >
                <MessageSquare className="h-5 w-5" />
                <span>Get Support</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 flex flex-col gap-2 items-center justify-center"
                onClick={() => toast.info("Expense claim form will open here")}
              >
                <CreditCard className="h-5 w-5" />
                <span>Claim Expense</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your calendar for the next few days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading schedule...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Team Standup</h4>
                    <p className="text-sm text-muted-foreground">Today • 9:30 AM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Project Review</h4>
                    <p className="text-sm text-muted-foreground">Today • 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-md">
                  <div className="bg-primary/10 p-2 rounded">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">Performance Review</h4>
                    <p className="text-sm text-muted-foreground">Tomorrow • 11:00 AM</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest Announcements</CardTitle>
            <CardDescription>Company updates and news</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading announcements...</div>
            ) : (
              <div className="space-y-4">
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium">New Benefits Package</h4>
                  <p className="text-sm text-muted-foreground">HR has announced updates to the company benefits package starting next month.</p>
                  <p className="text-xs text-muted-foreground mt-2">Posted: May 15, 2023</p>
                </div>
                <div className="p-3 border rounded-md">
                  <h4 className="font-medium">Office Closure Notice</h4>
                  <p className="text-sm text-muted-foreground">The office will be closed for maintenance on May 27th.</p>
                  <p className="text-xs text-muted-foreground mt-2">Posted: May 12, 2023</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Team</CardTitle>
            <CardDescription>People you work with</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading team data...</div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Sarah Johnson</h4>
                      <p className="text-sm text-muted-foreground">Team Lead</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Messaging feature not implemented")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" />
                      <AvatarFallback>MR</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Michael Rodriguez</h4>
                      <p className="text-sm text-muted-foreground">Senior Developer</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Messaging feature not implemented")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" />
                      <AvatarFallback>EW</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium">Emily Wong</h4>
                      <p className="text-sm text-muted-foreground">UX Designer</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => toast.info("Messaging feature not implemented")}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => toast.info("Team directory not implemented")}>
              View Full Team
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance & Goals</CardTitle>
            <CardDescription>Progress toward your targets</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading performance data...</div>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Q2 Objectives</span>
                    <span className="text-sm font-medium">75%</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Project Alpha Completion</span>
                    <span className="text-sm font-medium">60%</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Learning & Development</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                
                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Award className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-medium">Recent Achievement</h4>
                      <p className="text-sm text-muted-foreground">Completed Advanced Training</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-5 w-5 text-accent" />
                    <div>
                      <h4 className="font-medium">Next Review</h4>
                      <p className="text-sm text-muted-foreground">Scheduled for June 15, 2023</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <DashboardLayout sidebar={<EmployeeSidebar />}>
      {renderPageContent()}
    </DashboardLayout>
  );
};

export default EmployeeDashboard;
