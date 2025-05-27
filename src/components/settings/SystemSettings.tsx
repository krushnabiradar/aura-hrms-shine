
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Database, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { useSecuritySettings } from "@/hooks/useSecuritySettings";
import { useUserSessions } from "@/hooks/useUserSessions";

export const SystemSettings = () => {
  const { settings, isLoadingSettings, updateSetting } = useSecuritySettings();
  const { sessions, isLoadingSessions, terminateSession } = useUserSessions();

  const getSettingsByCategory = (category: string) => {
    return settings?.filter(setting => setting.category === category) || [];
  };

  const handleUpdateSetting = (settingId: string, newValue: any) => {
    updateSetting({ 
      id: settingId, 
      updates: { 
        setting_value: newValue,
        updated_at: new Date().toISOString()
      } 
    });
    toast.success("Setting updated successfully");
  };

  const handleTerminateSession = (sessionId: string) => {
    terminateSession(sessionId);
    toast.success("Session terminated");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">Configure system-wide security and operational settings</p>
        </div>
      </div>

      <Tabs defaultValue="security" className="space-y-4">
        <TabsList>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="authentication">Authentication</TabsTrigger>
          <TabsTrigger value="sessions">User Sessions</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>Configure system security policies and controls</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center">Loading security settings...</div>
              ) : (
                getSettingsByCategory('security').map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Badge variant="outline">Security</Badge>
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <pre>{JSON.stringify(setting.setting_value, null, 2)}</pre>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Authentication Settings
              </CardTitle>
              <CardDescription>Manage authentication policies and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center">Loading authentication settings...</div>
              ) : (
                getSettingsByCategory('authentication').map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Badge variant="outline">Authentication</Badge>
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <pre>{JSON.stringify(setting.setting_value, null, 2)}</pre>
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
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Active User Sessions
              </CardTitle>
              <CardDescription>Monitor and manage active user sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingSessions ? (
                  <div className="text-center">Loading user sessions...</div>
                ) : sessions && sessions.length > 0 ? (
                  sessions.filter(session => session.is_active).slice(0, 10).map((session) => (
                    <div key={session.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">Session {session.id.substring(0, 8)}...</div>
                        <div className="text-sm text-muted-foreground">
                          IP: {session.ip_address || 'Unknown'} | 
                          Last Activity: {new Date(session.last_activity).toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expires: {new Date(session.expires_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTerminateSession(session.id)}
                          disabled={!session.is_active}
                        >
                          Terminate
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No active sessions found</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Compliance Settings
              </CardTitle>
              <CardDescription>Data retention and compliance configurations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingSettings ? (
                <div className="text-center">Loading compliance settings...</div>
              ) : (
                getSettingsByCategory('compliance').map((setting) => (
                  <div key={setting.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <Label className="text-base font-medium">{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <p className="text-sm text-muted-foreground">{setting.description}</p>
                      </div>
                      <Badge variant="outline">Compliance</Badge>
                    </div>
                    <div className="text-sm bg-gray-50 dark:bg-gray-900 p-3 rounded">
                      <pre>{JSON.stringify(setting.setting_value, null, 2)}</pre>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
