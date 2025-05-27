
import { useState } from "react";
import { CreditCard, DollarSign, TrendingUp, Package, MoreHorizontal, Download } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/sonner";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import { useSubscriptionPlans } from "@/hooks/useSubscriptionPlans";
import { useBillingHistory } from "@/hooks/useBillingHistory";
import { useTenants } from "@/hooks/useTenants";

const BillingSubscriptionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Use real data hooks
  const { subscriptions, isLoadingSubscriptions } = useSubscriptions();
  const { plans, isLoadingPlans } = useSubscriptionPlans();
  const { billingHistory, isLoadingBillingHistory } = useBillingHistory();
  const { tenants } = useTenants();

  // Calculate real statistics
  const totalMRR = tenants?.reduce((sum, tenant) => sum + (tenant.mrr || 0), 0) || 0;
  const activeSubscriptions = subscriptions?.filter(sub => sub.status === "active").length || 0;
  const pastDueSubscriptions = subscriptions?.filter(sub => sub.status === "past_due").length || 0;
  const totalRevenue = billingHistory?.filter(bill => bill.status === "paid")
    .reduce((sum, bill) => sum + Number(bill.amount), 0) || 0;

  const filteredSubscriptions = subscriptions?.filter(sub =>
    sub.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan?.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredBilling = billingHistory?.filter(bill =>
    bill.tenant?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (bill.invoice_id && bill.invoice_id.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleBillingAction = (action: string, item: string) => {
    toast.info(`${action} for ${item} executed`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "paid":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "past_due":
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "suspended":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Billing & Subscriptions</h2>
        <p className="text-muted-foreground">Manage subscription plans, billing, and revenue analytics</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalMRR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active subscriptions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoadingSubscriptions ? "..." : activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Currently paying</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Past Due</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{isLoadingSubscriptions ? "..." : pastDueSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="billing">Billing History</TabsTrigger>
          <TabsTrigger value="plans">Plan Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Active Subscriptions</CardTitle>
                  <CardDescription>Manage tenant subscriptions and billing cycles</CardDescription>
                </div>
                <Input
                  placeholder="Search subscriptions..."
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
                    <TableHead>Tenant</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Current Period</TableHead>
                    <TableHead>Next Billing</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingSubscriptions ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading subscription data...
                      </TableCell>
                    </TableRow>
                  ) : filteredSubscriptions.length > 0 ? (
                    filteredSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">{subscription.tenant?.name || "Unknown"}</TableCell>
                        <TableCell>{subscription.plan?.name || "Unknown"}</TableCell>
                        <TableCell>${subscription.plan?.price || 0}/month</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(subscription.status)}`}>
                            {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell>{subscription.current_period_start} - {subscription.current_period_end}</TableCell>
                        <TableCell>{subscription.next_billing_date || "N/A"}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleBillingAction("View Details", subscription.tenant?.name || "")}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBillingAction("Change Plan", subscription.tenant?.name || "")}>
                                Change Plan
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBillingAction("Update Billing", subscription.tenant?.name || "")}>
                                Update Billing
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBillingAction("Cancel Subscription", subscription.tenant?.name || "")}>
                                Cancel Subscription
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View all billing transactions and payment history</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleBillingAction("Export", "billing history")}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice ID</TableHead>
                    <TableHead>Tenant</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBillingHistory ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center">
                        Loading billing history...
                      </TableCell>
                    </TableRow>
                  ) : filteredBilling.length > 0 ? (
                    filteredBilling.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.invoice_id || `INV-${bill.id.slice(0, 8)}`}</TableCell>
                        <TableCell>{bill.tenant?.name || "Unknown"}</TableCell>
                        <TableCell>${bill.amount}</TableCell>
                        <TableCell>{bill.billing_date}</TableCell>
                        <TableCell>{bill.payment_method || "Unknown"}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(bill.status)}`}>
                            {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleBillingAction("View Invoice", bill.invoice_id || "")}>
                                View Invoice
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleBillingAction("Download", bill.invoice_id || "")}>
                                Download PDF
                              </DropdownMenuItem>
                              {bill.status === "failed" && (
                                <DropdownMenuItem onClick={() => handleBillingAction("Retry Payment", bill.invoice_id || "")}>
                                  Retry Payment
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No billing history found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plans</CardTitle>
              <CardDescription>Configure pricing plans and features</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingPlans ? (
                <div className="text-center">Loading subscription plans...</div>
              ) : (
                <div className="grid gap-6 md:grid-cols-3">
                  {plans?.map((plan) => (
                    <Card key={plan.id} className="relative">
                      <CardHeader>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="text-2xl font-bold">
                          ${plan.price}
                          <span className="text-sm font-normal text-muted-foreground">/{plan.billing_cycle}</span>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="space-y-2 text-sm">
                          {Array.isArray(plan.features) ? plan.features.map((feature: string, idx: number) => (
                            <li key={idx} className="flex items-center gap-2">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                              {feature}
                            </li>
                          )) : null}
                        </ul>
                        <div className="pt-4 border-t space-y-2 text-xs text-muted-foreground">
                          <div>Max Users: {plan.max_users || "Unlimited"}</div>
                          <div>Storage: {plan.storage_gb}GB</div>
                        </div>
                        <div className="pt-4 border-t">
                          <Button variant="outline" className="w-full" onClick={() => handleBillingAction("Edit Plan", plan.name)}>
                            Edit Plan
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillingSubscriptionPage;
