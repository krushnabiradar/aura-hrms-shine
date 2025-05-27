
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useSecurityPolicies } from "@/hooks/useSecurityPolicies";
import { useSessionManagement } from "@/hooks/useSessionManagement";

export const SecurityPolicyMonitor = () => {
  const { 
    policyCompliance, 
    isCheckingPolicies, 
    cleanupSessions, 
    isCleaningSessions 
  } = useSecurityPolicies();
  
  const { sessionStats, isLoadingStats } = useSessionManagement();

  // Auto-cleanup sessions when violations are detected
  useEffect(() => {
    if (policyCompliance && !policyCompliance.session_timeout) {
      console.log('Session timeout violations detected, auto-cleaning...');
      cleanupSessions();
    }
  }, [policyCompliance, cleanupSessions]);

  const handleManualCleanup = () => {
    cleanupSessions();
    toast.success("Session cleanup initiated");
  };

  const getPolicyStatus = (policy: string, isCompliant: boolean) => {
    if (isCompliant) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>;
    }
    return <Badge variant="destructive">Violation</Badge>;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Policy Status
          </CardTitle>
          <CardDescription>Real-time security policy compliance monitoring</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCheckingPolicies ? (
            <div className="text-center">Checking policy compliance...</div>
          ) : policyCompliance ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Session Timeout</span>
                {getPolicyStatus('session_timeout', policyCompliance.session_timeout)}
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Concurrent Sessions</span>
                {getPolicyStatus('concurrent_limit', policyCompliance.session_concurrent_limit)}
              </div>
              <div className="flex items-center gap-2 pt-2">
                {Object.values(policyCompliance).every(Boolean) ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {Object.values(policyCompliance).every(Boolean) 
                    ? "All policies compliant" 
                    : "Policy violations detected"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No policy data available</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Statistics
          </CardTitle>
          <CardDescription>Active session monitoring and management</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingStats ? (
            <div className="text-center">Loading session statistics...</div>
          ) : sessionStats ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Sessions</span>
                <Badge variant="outline">{sessionStats.activeSessions}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Expired Today</span>
                <Badge variant="secondary">{sessionStats.expiredToday}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Concurrent Violations</span>
                <Badge variant={sessionStats.concurrentViolations > 0 ? "destructive" : "default"}>
                  {sessionStats.concurrentViolations}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Active Users</span>
                <Badge variant="outline">{sessionStats.totalUsers}</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualCleanup}
                disabled={isCleaningSessions}
                className="w-full mt-4"
              >
                {isCleaningSessions ? "Cleaning..." : "Cleanup Expired Sessions"}
              </Button>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">No session data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
