
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { 
  Briefcase, 
  Users, 
  Calendar, 
  Plus, 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle,
  Clock,
  Building,
  DollarSign
} from "lucide-react";
import { useRecruitment } from "@/hooks/useRecruitment";

export default function RecruitmentManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [newJobPosting, setNewJobPosting] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "full_time",
    salary_min: "",
    salary_max: "",
    description: "",
    requirements: ""
  });

  const {
    jobPostings,
    isLoadingJobPostings,
    jobApplications,
    isLoadingJobApplications,
    interviews,
    isLoadingInterviews,
    createJobPosting,
    isCreatingJobPosting,
    updateJobApplication,
    isUpdatingJobApplication,
    createInterview,
    isCreatingInterview
  } = useRecruitment();

  const handleCreateJobPosting = async () => {
    if (!newJobPosting.title || !newJobPosting.department) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      await createJobPosting({
        title: newJobPosting.title,
        department: newJobPosting.department,
        location: newJobPosting.location,
        employment_type: newJobPosting.employment_type as any,
        salary_min: newJobPosting.salary_min ? parseFloat(newJobPosting.salary_min) : null,
        salary_max: newJobPosting.salary_max ? parseFloat(newJobPosting.salary_max) : null,
        description: newJobPosting.description,
        requirements: newJobPosting.requirements,
        status: 'draft'
      });

      toast.success('Job posting created successfully!');
      setNewJobPosting({
        title: "",
        department: "",
        location: "",
        employment_type: "full_time",
        salary_min: "",
        salary_max: "",
        description: "",
        requirements: ""
      });
    } catch (error) {
      toast.error('Failed to create job posting');
    }
  };

  const handleUpdateApplicationStatus = async (id: string, status: string) => {
    try {
      await updateJobApplication({
        id,
        updates: { status, reviewed_at: new Date().toISOString() }
      });
      toast.success(`Application ${status} successfully!`);
    } catch (error) {
      toast.error('Failed to update application status');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: "bg-gray-100 text-gray-800",
      published: "bg-green-100 text-green-800",
      closed: "bg-red-100 text-red-800",
      pending: "bg-yellow-100 text-yellow-800",
      reviewing: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      scheduled: "bg-purple-100 text-purple-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800"
    };
    
    return (
      <Badge variant="secondary" className={colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const filteredJobPostings = jobPostings?.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || job.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const filteredApplications = jobApplications?.filter(app => {
    const matchesSearch = app.applicant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.applicant_email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Recruitment Management</h2>
          <p className="text-muted-foreground">Manage job postings, applications, and interviews</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Job Postings</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobPostings?.filter(job => job.status === 'published').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Currently hiring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {jobApplications?.filter(app => app.status === 'pending').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Interviews</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews?.filter(interview => interview.status === 'scheduled').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobApplications?.length || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="job-postings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="job-postings">Job Postings</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="interviews">Interviews</TabsTrigger>
        </TabsList>

        <TabsContent value="job-postings" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Job Postings</CardTitle>
                  <CardDescription>Manage your open positions</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Job Posting
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create New Job Posting</DialogTitle>
                      <DialogDescription>
                        Fill in the details for the new job posting
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Job Title *</Label>
                          <Input
                            id="title"
                            value={newJobPosting.title}
                            onChange={(e) => setNewJobPosting({...newJobPosting, title: e.target.value})}
                            placeholder="e.g. Software Engineer"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="department">Department *</Label>
                          <Input
                            id="department"
                            value={newJobPosting.department}
                            onChange={(e) => setNewJobPosting({...newJobPosting, department: e.target.value})}
                            placeholder="e.g. Engineering"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newJobPosting.location}
                            onChange={(e) => setNewJobPosting({...newJobPosting, location: e.target.value})}
                            placeholder="e.g. San Francisco, CA"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="employment_type">Employment Type</Label>
                          <Select
                            value={newJobPosting.employment_type}
                            onValueChange={(value) => setNewJobPosting({...newJobPosting, employment_type: value})}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="full_time">Full Time</SelectItem>
                              <SelectItem value="part_time">Part Time</SelectItem>
                              <SelectItem value="contract">Contract</SelectItem>
                              <SelectItem value="internship">Internship</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="salary_min">Min Salary</Label>
                          <Input
                            id="salary_min"
                            type="number"
                            value={newJobPosting.salary_min}
                            onChange={(e) => setNewJobPosting({...newJobPosting, salary_min: e.target.value})}
                            placeholder="50000"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="salary_max">Max Salary</Label>
                          <Input
                            id="salary_max"
                            type="number"
                            value={newJobPosting.salary_max}
                            onChange={(e) => setNewJobPosting({...newJobPosting, salary_max: e.target.value})}
                            placeholder="80000"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Job Description</Label>
                        <Textarea
                          id="description"
                          value={newJobPosting.description}
                          onChange={(e) => setNewJobPosting({...newJobPosting, description: e.target.value})}
                          placeholder="Describe the role and responsibilities..."
                          rows={3}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="requirements">Requirements</Label>
                        <Textarea
                          id="requirements"
                          value={newJobPosting.requirements}
                          onChange={(e) => setNewJobPosting({...newJobPosting, requirements: e.target.value})}
                          placeholder="List the required qualifications..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <Button 
                      onClick={handleCreateJobPosting}
                      disabled={isCreatingJobPosting}
                      className="w-full"
                    >
                      {isCreatingJobPosting ? 'Creating...' : 'Create Job Posting'}
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search job postings..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingJobPostings ? (
                <div className="text-center py-8">Loading job postings...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Title</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Salary Range</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredJobPostings.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">{job.title}</TableCell>
                        <TableCell>{job.department}</TableCell>
                        <TableCell>{job.location || 'Remote'}</TableCell>
                        <TableCell>
                          {job.salary_min && job.salary_max 
                            ? `$${job.salary_min.toLocaleString()} - $${job.salary_max.toLocaleString()}`
                            : 'Not specified'
                          }
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Job Applications</CardTitle>
              <CardDescription>Review and manage candidate applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewing">Reviewing</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingJobApplications ? (
                <div className="text-center py-8">Loading applications...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Applicant</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Applied Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{application.applicant_name}</div>
                            <div className="text-sm text-muted-foreground">{application.applicant_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{application.job_postings?.title}</TableCell>
                        <TableCell>{new Date(application.applied_at).toLocaleDateString()}</TableCell>
                        <TableCell>{getStatusBadge(application.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, 'approved')}
                              disabled={isUpdatingJobApplication}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateApplicationStatus(application.id, 'rejected')}
                              disabled={isUpdatingJobApplication}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="interviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Interviews</CardTitle>
              <CardDescription>Schedule and manage candidate interviews</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingInterviews ? (
                <div className="text-center py-8">Loading interviews...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {interviews?.map((interview) => (
                      <TableRow key={interview.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{interview.job_applications?.applicant_name}</div>
                            <div className="text-sm text-muted-foreground">{interview.job_applications?.applicant_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>{interview.job_applications?.job_postings?.title}</TableCell>
                        <TableCell>{new Date(interview.scheduled_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {interview.interview_type.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(interview.status)}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
