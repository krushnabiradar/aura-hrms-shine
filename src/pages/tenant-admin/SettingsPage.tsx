
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { 
  Settings, 
  Building, 
  Users, 
  Clock, 
  Calendar,
  DollarSign,
  Bell,
  Shield,
  Palette,
  Mail,
  Globe
} from "lucide-react";
import { useTenantSettings } from "@/hooks/useTenantSettings";

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState({
    company_name: "Acme Corporation",
    company_address: "123 Business St, San Francisco, CA",
    company_phone: "+1 (555) 123-4567",
    company_email: "info@acme.com",
    timezone: "America/Los_Angeles",
    date_format: "MM/DD/YYYY",
    currency: "USD"
  });

  const [hrSettings, setHrSettings] = useState({
    working_hours_start: "09:00",
    working_hours_end: "17:00",
    working_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    break_duration: 60,
    overtime_threshold: 40,
    annual_leave_days: 20,
    sick_leave_days: 10,
    probation_period: 90
  });

  const [payrollSettings, setPayrollSettings] = useState({
    pay_frequency: "bi_weekly",
    pay_day: "friday",
    overtime_rate: 1.5,
    tax_rate: 0.25,
    benefits_percentage: 0.15,
    direct_deposit_enabled: true,
    payslip_template: "standard"
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    leave_request_notifications: true,
    attendance_alerts: true,
    payroll_notifications: true,
    birthday_reminders: true,
    anniversary_reminders: true
  });

  const {
    upsertSetting,
    isUpsertingSetting,
    getSetting,
    getSettingsByCategory
  } = useTenantSettings();

  const handleSaveGeneralSettings = async () => {
    try {
      for (const [key, value] of Object.entries(generalSettings)) {
        await upsertSetting({
          setting_category: 'general',
          setting_key: key,
          setting_value: { value },
          description: `General setting: ${key}`
        });
      }
      toast.success('General settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save general settings');
    }
  };

  const handleSaveHRSettings = async () => {
    try {
      for (const [key, value] of Object.entries(hrSettings)) {
        await upsertSetting({
          setting_category: 'hr',
          setting_key: key,
          setting_value: { value },
          description: `HR setting: ${key}`
        });
      }
      toast.success('HR settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save HR settings');
    }
  };

  const handleSavePayrollSettings = async () => {
    try {
      for (const [key, value] of Object.entries(payrollSettings)) {
        await upsertSetting({
          setting_category: 'payroll',
          setting_key: key,
          setting_value: { value },
          description: `Payroll setting: ${key}`
        });
      }
      toast.success('Payroll settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save payroll settings');
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      for (const [key, value] of Object.entries(notificationSettings)) {
        await upsertSetting({
          setting_category: 'notifications',
          setting_key: key,
          setting_value: { value },
          description: `Notification setting: ${key}`
        });
      }
      toast.success('Notification settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save notification settings');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage your organization settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="hr">HR Policies</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5" />
                <CardTitle>Company Information</CardTitle>
              </div>
              <CardDescription>
                Basic information about your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={generalSettings.company_name}
                    onChange={(e) => setGeneralSettings({...generalSettings, company_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_email">Company Email</Label>
                  <Input
                    id="company_email"
                    type="email"
                    value={generalSettings.company_email}
                    onChange={(e) => setGeneralSettings({...generalSettings, company_email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company_address">Company Address</Label>
                <Textarea
                  id="company_address"
                  value={generalSettings.company_address}
                  onChange={(e) => setGeneralSettings({...generalSettings, company_address: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company_phone">Phone Number</Label>
                  <Input
                    id="company_phone"
                    value={generalSettings.company_phone}
                    onChange={(e) => setGeneralSettings({...generalSettings, company_phone: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={generalSettings.timezone}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, timezone: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date_format">Date Format</Label>
                  <Select
                    value={generalSettings.date_format}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, date_format: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select
                    value={generalSettings.currency}
                    onValueChange={(value) => setGeneralSettings({...generalSettings, currency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button 
                onClick={handleSaveGeneralSettings}
                disabled={isUpsertingSetting}
              >
                {isUpsertingSetting ? 'Saving...' : 'Save General Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Working Hours & Schedule</CardTitle>
              </div>
              <CardDescription>
                Define standard working hours and schedule policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="working_hours_start">Start Time</Label>
                  <Input
                    id="working_hours_start"
                    type="time"
                    value={hrSettings.working_hours_start}
                    onChange={(e) => setHrSettings({...hrSettings, working_hours_start: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="working_hours_end">End Time</Label>
                  <Input
                    id="working_hours_end"
                    type="time"
                    value={hrSettings.working_hours_end}
                    onChange={(e) => setHrSettings({...hrSettings, working_hours_end: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="break_duration">Break Duration (minutes)</Label>
                  <Input
                    id="break_duration"
                    type="number"
                    value={hrSettings.break_duration}
                    onChange={(e) => setHrSettings({...hrSettings, break_duration: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="overtime_threshold">Overtime Threshold (hours/week)</Label>
                  <Input
                    id="overtime_threshold"
                    type="number"
                    value={hrSettings.overtime_threshold}
                    onChange={(e) => setHrSettings({...hrSettings, overtime_threshold: parseInt(e.target.value)})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Leave Policies</CardTitle>
              </div>
              <CardDescription>
                Configure leave entitlements and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="annual_leave_days">Annual Leave Days</Label>
                  <Input
                    id="annual_leave_days"
                    type="number"
                    value={hrSettings.annual_leave_days}
                    onChange={(e) => setHrSettings({...hrSettings, annual_leave_days: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sick_leave_days">Sick Leave Days</Label>
                  <Input
                    id="sick_leave_days"
                    type="number"
                    value={hrSettings.sick_leave_days}
                    onChange={(e) => setHrSettings({...hrSettings, sick_leave_days: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="probation_period">Probation Period (days)</Label>
                  <Input
                    id="probation_period"
                    type="number"
                    value={hrSettings.probation_period}
                    onChange={(e) => setHrSettings({...hrSettings, probation_period: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveHRSettings}
                disabled={isUpsertingSetting}
              >
                {isUpsertingSetting ? 'Saving...' : 'Save HR Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <CardTitle>Payroll Configuration</CardTitle>
              </div>
              <CardDescription>
                Configure payroll processing settings and policies
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pay_frequency">Pay Frequency</Label>
                  <Select
                    value={payrollSettings.pay_frequency}
                    onValueChange={(value) => setPayrollSettings({...payrollSettings, pay_frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="semi_monthly">Semi-monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pay_day">Pay Day</Label>
                  <Select
                    value={payrollSettings.pay_day}
                    onValueChange={(value) => setPayrollSettings({...payrollSettings, pay_day: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monday">Monday</SelectItem>
                      <SelectItem value="tuesday">Tuesday</SelectItem>
                      <SelectItem value="wednesday">Wednesday</SelectItem>
                      <SelectItem value="thursday">Thursday</SelectItem>
                      <SelectItem value="friday">Friday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="overtime_rate">Overtime Rate (multiplier)</Label>
                  <Input
                    id="overtime_rate"
                    type="number"
                    step="0.1"
                    value={payrollSettings.overtime_rate}
                    onChange={(e) => setPayrollSettings({...payrollSettings, overtime_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Default Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={payrollSettings.tax_rate}
                    onChange={(e) => setPayrollSettings({...payrollSettings, tax_rate: parseFloat(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="benefits_percentage">Benefits Percentage (%)</Label>
                  <Input
                    id="benefits_percentage"
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={payrollSettings.benefits_percentage}
                    onChange={(e) => setPayrollSettings({...payrollSettings, benefits_percentage: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="direct_deposit"
                  checked={payrollSettings.direct_deposit_enabled}
                  onCheckedChange={(checked) => setPayrollSettings({...payrollSettings, direct_deposit_enabled: checked})}
                />
                <Label htmlFor="direct_deposit">Enable Direct Deposit</Label>
              </div>
              <Button 
                onClick={handleSavePayrollSettings}
                disabled={isUpsertingSetting}
              >
                {isUpsertingSetting ? 'Saving...' : 'Save Payroll Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <CardTitle>Notification Preferences</CardTitle>
              </div>
              <CardDescription>
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={notificationSettings.email_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, email_notifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via SMS</p>
                  </div>
                  <Switch
                    checked={notificationSettings.sms_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, sms_notifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Leave Request Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about leave requests</p>
                  </div>
                  <Switch
                    checked={notificationSettings.leave_request_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, leave_request_notifications: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Attendance Alerts</Label>
                    <p className="text-sm text-muted-foreground">Get alerts for attendance issues</p>
                  </div>
                  <Switch
                    checked={notificationSettings.attendance_alerts}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, attendance_alerts: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payroll Notifications</Label>
                    <p className="text-sm text-muted-foreground">Get notified about payroll processing</p>
                  </div>
                  <Switch
                    checked={notificationSettings.payroll_notifications}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, payroll_notifications: checked})}
                  />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Birthday Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminders for employee birthdays</p>
                  </div>
                  <Switch
                    checked={notificationSettings.birthday_reminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, birthday_reminders: checked})}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anniversary Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminders for work anniversaries</p>
                  </div>
                  <Switch
                    checked={notificationSettings.anniversary_reminders}
                    onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, anniversary_reminders: checked})}
                  />
                </div>
              </div>
              <Button 
                onClick={handleSaveNotificationSettings}
                disabled={isUpsertingSetting}
              >
                {isUpsertingSetting ? 'Saving...' : 'Save Notification Settings'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Security Settings</CardTitle>
              </div>
              <CardDescription>
                Configure security and access control settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Require 2FA for all users</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Session Timeout</Label>
                    <p className="text-sm text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Login Notifications</Label>
                    <p className="text-sm text-muted-foreground">Notify users of new logins</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label>Password Requirements</Label>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Minimum 8 characters</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Require uppercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Require lowercase letter</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Require number</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Require special character</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button>Save Security Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
