
import { useState } from "react";
import { HelpCircle, Book, MessageSquare, Mail, Phone, ExternalLink, Search } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/sonner";

const HelpSupportPage = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const faqItems = [
    {
      id: "1",
      question: "How do I reset a user's password?",
      answer: "Go to User Management, find the user, click on their profile, and select 'Reset Password'. An email will be sent to the user with instructions.",
      category: "User Management"
    },
    {
      id: "2", 
      question: "How do I add a new tenant organization?",
      answer: "Navigate to Tenant Management and click 'Create Tenant'. Fill in the organization details and assign a subscription plan.",
      category: "Tenant Management"
    },
    {
      id: "3",
      question: "What security settings should I configure?",
      answer: "Enable two-factor authentication, set appropriate session timeouts, configure password policies, and regularly review user permissions.",
      category: "Security"
    },
    {
      id: "4",
      question: "How do I generate system reports?",
      answer: "Use the Analytics section to create custom reports. You can filter by date range, tenant, or specific metrics.",
      category: "Analytics"
    },
    {
      id: "5",
      question: "How do I manage billing and subscriptions?",
      answer: "Go to Billing & Subscriptions to view payment history, update subscription plans, and manage billing details for each tenant.",
      category: "Billing"
    }
  ];

  const contactOptions = [
    {
      title: "Email Support",
      description: "Get help via email within 24 hours",
      action: "support@aurahrms.com",
      icon: Mail,
      type: "email"
    },
    {
      title: "Phone Support",
      description: "Speak with our support team",
      action: "+1-800-AURA-HRMS",
      icon: Phone,
      type: "phone"
    },
    {
      title: "Live Chat",
      description: "Chat with support agents",
      action: "Start Chat",
      icon: MessageSquare,
      type: "chat"
    },
    {
      title: "Documentation",
      description: "Browse our knowledge base",
      action: "View Docs",
      icon: Book,
      type: "docs"
    }
  ];

  const systemInfo = {
    version: "1.0.0",
    build: "2024.01.15",
    environment: "Production",
    lastUpdate: "2024-01-15",
    uptime: "99.9%"
  };

  const filteredFAQs = faqItems.filter(item =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactAction = (option: typeof contactOptions[0]) => {
    switch (option.type) {
      case "email":
        window.open(`mailto:${option.action}`);
        break;
      case "phone":
        toast.info(`Call ${option.action} for support`);
        break;
      case "chat":
        toast.info("Live chat feature coming soon");
        break;
      case "docs":
        window.open("https://docs.aurahrms.com", "_blank");
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Help & Support</h2>
        <p className="text-muted-foreground">Get help and find resources for managing your HRMS system</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {contactOptions.map((option) => (
          <Card key={option.title} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleContactAction(option)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{option.title}</CardTitle>
              <option.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{option.description}</div>
              <div className="mt-2 text-sm font-medium text-primary">{option.action}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="faq" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Find answers to common questions about system administration</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search FAQs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left">
                      <div className="flex items-center gap-2">
                        <span>{item.question}</span>
                        <Badge variant="outline" className="text-xs">{item.category}</Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No FAQs found matching your search.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Getting Started Guide
                </CardTitle>
                <CardDescription>Learn the basics of system administration</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Setting up your first tenant</li>
                  <li>• Creating user accounts</li>
                  <li>• Configuring security settings</li>
                  <li>• Managing subscriptions</li>
                </ul>
                <Button className="mt-4" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Advanced Administration
                </CardTitle>
                <CardDescription>Advanced features and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Advanced security policies</li>
                  <li>• Custom reporting</li>
                  <li>• API management</li>
                  <li>• System monitoring</li>
                </ul>
                <Button className="mt-4" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  User Management
                </CardTitle>
                <CardDescription>Managing users and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• User roles and permissions</li>
                  <li>• Bulk user operations</li>
                  <li>• Password policies</li>
                  <li>• Account provisioning</li>
                </ul>
                <Button className="mt-4" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Guide
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Book className="h-5 w-5" />
                  Billing & Subscriptions
                </CardTitle>
                <CardDescription>Managing billing and subscription plans</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Subscription plan management</li>
                  <li>• Invoice generation</li>
                  <li>• Payment processing</li>
                  <li>• Revenue reporting</li>
                </ul>
                <Button className="mt-4" variant="outline">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Guide
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
              <CardDescription>Troubleshoot common problems</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-medium">Users cannot log in</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check if their account is active, password hasn't expired, and there are no security lockouts.
                  </p>
                  <Button variant="link" className="p-0 mt-2">View detailed solution →</Button>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-medium">Billing sync issues</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Verify payment gateway connections and check for failed payment notifications.
                  </p>
                  <Button variant="link" className="p-0 mt-2">View detailed solution →</Button>
                </div>

                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-medium">Performance issues</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Monitor system resources, check database performance, and review recent changes.
                  </p>
                  <Button variant="link" className="p-0 mt-2">View detailed solution →</Button>
                </div>

                <div className="border-l-4 border-green-500 pl-4">
                  <h4 className="font-medium">Data synchronization problems</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Check network connectivity, verify API endpoints, and review sync logs.
                  </p>
                  <Button variant="link" className="p-0 mt-2">View detailed solution →</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>Current system details and status</CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Version</dt>
                    <dd className="text-sm text-muted-foreground">{systemInfo.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Build</dt>
                    <dd className="text-sm text-muted-foreground">{systemInfo.build}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Environment</dt>
                    <dd className="text-sm text-muted-foreground">{systemInfo.environment}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Last Update</dt>
                    <dd className="text-sm text-muted-foreground">{systemInfo.lastUpdate}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium">Uptime</dt>
                    <dd className="text-sm text-muted-foreground">{systemInfo.uptime}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support Resources</CardTitle>
                <CardDescription>Additional help and resources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    API Documentation
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Video Tutorials
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Community Forum
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Release Notes
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Status Page
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HelpSupportPage;
