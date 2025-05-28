
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePerformance } from '@/hooks/usePerformance';
import { Plus, Target, Users, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

export const PerformanceManagement = () => {
  const { toast } = useToast();
  const {
    performanceCycles,
    performanceReviews,
    performanceGoals,
    competencies,
    isLoadingCycles,
    createPerformanceCycle,
    createPerformanceGoal,
    isCreatingCycle,
    isCreatingGoal
  } = usePerformance();

  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false);
  const [newCycle, setNewCycle] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [newGoal, setNewGoal] = useState({
    employee_id: '',
    title: '',
    description: '',
    target_value: '',
    due_date: ''
  });

  const handleCreateCycle = () => {
    if (!newCycle.name || !newCycle.start_date || !newCycle.end_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createPerformanceCycle(newCycle, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Performance cycle created successfully"
        });
        setIsCreateCycleOpen(false);
        setNewCycle({ name: '', description: '', start_date: '', end_date: '' });
      }
    });
  };

  const handleCreateGoal = () => {
    if (!newGoal.employee_id || !newGoal.title) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    createPerformanceGoal(newGoal, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: "Performance goal created successfully"
        });
        setIsCreateGoalOpen(false);
        setNewGoal({ employee_id: '', title: '', description: '', target_value: '', due_date: '' });
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'draft': return 'bg-gray-500';
      case 'completed': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Performance Management</h2>
          <p className="text-muted-foreground">Manage employee performance cycles, reviews, and goals</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isCreateCycleOpen} onOpenChange={setIsCreateCycleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Cycle
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Performance Cycle</DialogTitle>
                <DialogDescription>Set up a new performance review cycle</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cycle-name">Name</Label>
                  <Input
                    id="cycle-name"
                    value={newCycle.name}
                    onChange={(e) => setNewCycle({ ...newCycle, name: e.target.value })}
                    placeholder="Q1 2024 Performance Review"
                  />
                </div>
                <div>
                  <Label htmlFor="cycle-description">Description</Label>
                  <Textarea
                    id="cycle-description"
                    value={newCycle.description}
                    onChange={(e) => setNewCycle({ ...newCycle, description: e.target.value })}
                    placeholder="Quarterly performance review cycle"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newCycle.start_date}
                      onChange={(e) => setNewCycle({ ...newCycle, start_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newCycle.end_date}
                      onChange={(e) => setNewCycle({ ...newCycle, end_date: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreateCycle} disabled={isCreatingCycle} className="w-full">
                  {isCreatingCycle ? 'Creating...' : 'Create Cycle'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Target className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Performance Goal</DialogTitle>
                <DialogDescription>Set up a new performance goal for an employee</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="employee-id">Employee ID</Label>
                  <Input
                    id="employee-id"
                    value={newGoal.employee_id}
                    onChange={(e) => setNewGoal({ ...newGoal, employee_id: e.target.value })}
                    placeholder="Employee UUID"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-title">Title</Label>
                  <Input
                    id="goal-title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    placeholder="Increase sales by 20%"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    placeholder="Detailed description of the goal"
                  />
                </div>
                <div>
                  <Label htmlFor="target-value">Target Value</Label>
                  <Input
                    id="target-value"
                    value={newGoal.target_value}
                    onChange={(e) => setNewGoal({ ...newGoal, target_value: e.target.value })}
                    placeholder="20% increase"
                  />
                </div>
                <div>
                  <Label htmlFor="goal-due-date">Due Date</Label>
                  <Input
                    id="goal-due-date"
                    type="date"
                    value={newGoal.due_date}
                    onChange={(e) => setNewGoal({ ...newGoal, due_date: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateGoal} disabled={isCreatingGoal} className="w-full">
                  {isCreatingGoal ? 'Creating...' : 'Create Goal'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="cycles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cycles">Performance Cycles</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="competencies">Competencies</TabsTrigger>
        </TabsList>

        <TabsContent value="cycles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {performanceCycles?.map((cycle) => (
              <Card key={cycle.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{cycle.name}</CardTitle>
                    <Badge className={getStatusColor(cycle.status)}>
                      {cycle.status}
                    </Badge>
                  </div>
                  <CardDescription>{cycle.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(cycle.start_date).toLocaleDateString()} - {new Date(cycle.end_date).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <div className="grid gap-4">
            {performanceReviews?.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Performance Review</CardTitle>
                    <Badge className={getStatusColor(review.status)}>
                      {review.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Employee ID: {review.employee_id}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm font-medium">Self Review</div>
                      <div className="text-sm text-muted-foreground">
                        {review.self_review_completed ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Manager Review</div>
                      <div className="text-sm text-muted-foreground">
                        {review.manager_review_completed ? 'Completed' : 'Pending'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Overall Rating</div>
                      <div className="text-sm text-muted-foreground">
                        {review.overall_rating ? `${review.overall_rating}/5` : 'Not rated'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Due Date</div>
                      <div className="text-sm text-muted-foreground">
                        {review.due_date ? new Date(review.due_date).toLocaleDateString() : 'No due date'}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <div className="grid gap-4">
            {performanceGoals?.map((goal) => (
              <Card key={goal.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status}
                    </Badge>
                  </div>
                  <CardDescription>{goal.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Progress</span>
                        <span>{goal.progress_percentage || 0}%</span>
                      </div>
                      <Progress value={goal.progress_percentage || 0} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Target</div>
                        <div className="text-muted-foreground">{goal.target_value || 'Not set'}</div>
                      </div>
                      <div>
                        <div className="font-medium">Current</div>
                        <div className="text-muted-foreground">{goal.current_value || 'Not set'}</div>
                      </div>
                    </div>
                    {goal.due_date && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4 mr-2" />
                        Due: {new Date(goal.due_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="competencies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {competencies?.map((competency) => (
              <Card key={competency.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{competency.name}</CardTitle>
                  <CardDescription>{competency.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Badge variant="outline">{competency.category}</Badge>
                    <div className="text-sm text-muted-foreground">
                      Rating Scale: {competency.rating_scale ? 
                        `${(competency.rating_scale as any).min}-${(competency.rating_scale as any).max}` : 
                        'Not configured'
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
