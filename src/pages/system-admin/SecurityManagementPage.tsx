import { useState } from "react";
import { Shield, Users, Lock, AlertTriangle, Eye, EyeOff, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useUserSessions } from "@/hooks/useUserSessions";
import { useSystemLogs } from "@/hooks/useSystemLogs";

const SecurityManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { settings, isLoadingSettings, updateSetting } = useSecuritySettings();
  const { sessions, isLoadingSessions, terminateSession } = useUserSessions();
  const { logs, isLoadingLogs } = useSystemLogs();

  const securityLogs = logs?.filter(log => 
    log.action.includes('login') || 
    log.action.includes('security') || 
    log.action.includes('auth') ||
    log.severity === 'warning' ||
    log.severity === 'error'
  ) || [];

  const handleSecurityAction = (action: string, item: string) => {
    toast.info(`${action} for ${item} executed`);
  };

  const handleSettingToggle = (settingId: string, currentValue: any) => {
    const newValue = String(currentValue) === 'true' ? 'false' : 'true';
    updateSetting({ 
      id: settingId, 
      updates: { 
        setting_value: newValue,
        updated_at: new Date().toISOString()
      } 
    });
    toast.success("Security setting updated");
  };

  const getSecurityLevel = () => {
    const twoFactorEnabled = settings?.find(s => s.setting_key === 'two_factor_required')?.setting_value === 'true';
    const sessionTimeout = parseInt(String(settings?.find(s => s.setting_key === 'session_timeout')?.setting_value || '3600'));
    const minPasswordLength = parseInt(String(settings?.find(s => s.setting_key === 'password_min_length')?.setting_value || '8'));
    
    let score = 0;
    if (twoFactorEnabled) score += 3;
    if (sessionTimeout <= 1800) score += 2;
    if (minPasswordLength >= 12) score += 2;
    if (minPasswordLength >= 8) score += 1;
    
    if (score >= 6) return { level: "High", color: "bg-green-500" };
    if (score >= 3) return { level: "Medium", color: "bg-yellow-500" };
    return { level: "Low", color: "bg-red-500" };
  };

  const securityLevel = getSecurityLevel();

  const formatSettingValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value ? 'Enabled' : 'Disabled';
    if (value === null || value === undefined) return 'Not set';
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  const formatLogDetails = (details: any): string => {
    if (typeof details === 'string') return details;
    if (details === null || details === undefined) return 'N/A';
    try {
      return JSON.stringify(details);
    } catch {
      return String(details);
    }
  };

  const formatSessionId = (sessionId: any): string => {
    if (typeof sessionId === 'string') return sessionId.substring(0, 8) + '...';
    if (typeof sessionId === 'number') return sessionId.toString().substring(0, 8) + '...';
    return 'Unknown';
  };

  const formatUserId = (userId: any): string => {
    if (typeof userId === 'string') return userId.substring(0, 8) + '...';
    if (typeof userId === 'number') return userId.toString().substring(0, 8) + '...';
    return 'System';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Security Management</h2>
          <p className="text-muted-foreground">Monitor and configure system security settings</p>
        </div>
        <Button onClick={() => handleSecurityAction("Export Security Report", "system")}>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className={`h-2 w-2 rounded-full ${securityLevel.color}`} />
              <div className="text-2xl font-bold">{securityLevel.level}</div>
            </div>
            <p className="text-xs text-muted-foreground">Overall system security</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingSessions ? "..." : sessions?.filter(s => s.is_active).length || 0}</div>
            <p className="text-xs text-muted-foreground">Currently logged in</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLogs.filter(log => log.severity === 'warning' || log.severity === 'error').length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityLogs.filter(log => log.action.includes('failed')).length}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Configuration</CardTitle>
              <CardDescription>Configure system-wide security policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center">Loading security settings...</div>
              ) : (
                settings?.filter(s => s.category === 'security' || s.category === 'authentication').map((setting) => (
                  <div key={setting.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</div>
                      <div className="text-sm text-muted-foreground">{setting.description}</div>
                      <div className="text-xs text-muted-foreground">
                        Current: {formatSettingValue(setting.setting_value)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{setting.category}</Badge>
                      {setting.setting_key.includes('required') || setting.setting_key.includes('enable') ? (
                        <Switch
                          checked={String(setting.setting_value) === 'true'}
                          onCheckedChange={() => handleSettingToggle(setting.id, setting.setting_value)}
                        />
                      ) : (
                        <Button variant="outline" size="sm">
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Active User Sessions</CardTitle>
                  <CardDescription>Monitor and manage active user sessions</CardDescription>
                </div>
                <Input
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Last Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSessions ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading sessions...
                      </TableCell>
                    </TableRow>
                  ) : sessions?.filter(session => session.is_active).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell className="font-mono text-sm">
                        {formatSessionId(session.id)}
                      </TableCell>
                      <TableCell>{formatUserId(session.user_id)}</TableCell>
                      <TableCell>{session.ip_address || 'Unknown'}</TableCell>
                      <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                      <TableCell>{new Date(session.last_activity).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => terminateSession(String(session.id))}
                        >
                          Terminate
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) || (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No active sessions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Event Logs</CardTitle>
              <CardDescription>Monitor security-related events and incidents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingLogs ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading security logs...
                      </TableCell>
                    </TableRow>
                  ) : securityLogs.slice(0, 20).map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>{formatUserId(log.user_id)}</TableCell>
                      <TableCell>{log.ip_address || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={
                          log.severity === 'error' ? 'destructive' :
                          log.severity === 'warning' ? 'secondary' : 'default'
                        }>
                          {log.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {formatLogDetails(log.details)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Detection</CardTitle>
              <CardDescription>Automated threat detection and response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Brute Force Detection</div>
                    <div className="text-sm text-muted-foreground">Monitor for repeated failed login attempts</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Suspicious IP Monitoring</div>
                    <div className="text-sm text-muted-foreground">Track logins from unusual locations</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Session Anomaly Detection</div>
                    <div className="text-sm text-muted-foreground">Detect unusual session patterns</div>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityManagementPage;
