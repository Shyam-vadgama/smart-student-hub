import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Edit, Save, X, Settings, CheckCircle, XCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

interface ApprovalStage {
  stageName: string;
  stageOrder: number;
  requiredRoles: string[];
  requireAll: boolean;
  description?: string;
}

interface ApprovalWorkflow {
  _id: string;
  name: string;
  description: string;
  contentType: string;
  stages: ApprovalStage[];
  isActive: boolean;
  college: any;
  department?: any;
  createdBy: any;
  createdAt: string;
}

export default function ApprovalWorkflowConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<ApprovalWorkflow | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contentType: 'all',
    stages: [] as ApprovalStage[]
  });

  // Stage form state
  const [stageForm, setStageForm] = useState({
    stageName: '',
    stageOrder: 1,
    requiredRoles: [] as string[],
    requireAll: false,
    description: ''
  });

  const roleOptions = ['faculty', 'hod', 'principal', 'shiksan_mantri'];
  const contentTypeOptions = [
    { value: 'all', label: 'All Content Types' },
    { value: 'project', label: 'Projects' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'resume', label: 'Resumes' },
    { value: 'marks', label: 'Marks' }
  ];

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('/api/approval-workflows', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch workflows',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddStage = () => {
    if (!stageForm.stageName || stageForm.requiredRoles.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in stage name and select at least one role',
        variant: 'destructive'
      });
      return;
    }

    setFormData(prev => ({
      ...prev,
      stages: [...prev.stages, { ...stageForm }].sort((a, b) => a.stageOrder - b.stageOrder)
    }));

    setStageForm({
      stageName: '',
      stageOrder: formData.stages.length + 2,
      requiredRoles: [],
      requireAll: false,
      description: ''
    });
  };

  const handleRemoveStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stages: prev.stages.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || formData.stages.length === 0) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields and add at least one stage',
        variant: 'destructive'
      });
      return;
    }

    try {
      const url = editingWorkflow
        ? `/api/approval-workflows/${editingWorkflow._id}`
        : '/api/approval-workflows';

      const response = await fetch(url, {
        method: editingWorkflow ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Workflow ${editingWorkflow ? 'updated' : 'created'} successfully`
        });
        setIsDialogOpen(false);
        resetForm();
        fetchWorkflows();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save workflow',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (workflow: ApprovalWorkflow) => {
    setEditingWorkflow(workflow);
    setFormData({
      name: workflow.name,
      description: workflow.description,
      contentType: workflow.contentType,
      stages: workflow.stages
    });
    setStageForm({
      stageName: '',
      stageOrder: workflow.stages.length + 1,
      requiredRoles: [],
      requireAll: false,
      description: ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workflow?')) return;

    try {
      const response = await fetch(`/api/approval-workflows/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Workflow deleted successfully'
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete workflow',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (id: string) => {
    try {
      const response = await fetch(`/api/approval-workflows/${id}/toggle-active`, {
        method: 'PATCH',
        credentials: 'include'
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Workflow status updated'
        });
        fetchWorkflows();
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update workflow status',
        variant: 'destructive'
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      contentType: 'all',
      stages: []
    });
    setStageForm({
      stageName: '',
      stageOrder: 1,
      requiredRoles: [],
      requireAll: false,
      description: ''
    });
    setEditingWorkflow(null);
  };

  const handleRoleToggle = (role: string) => {
    setStageForm(prev => ({
      ...prev,
      requiredRoles: prev.requiredRoles.includes(role)
        ? prev.requiredRoles.filter(r => r !== role)
        : [...prev.requiredRoles, role]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Approval Workflow Configuration</h1>
          <p className="text-muted-foreground mt-2">
            Configure multi-stage approval workflows for student content
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
              </DialogTitle>
              <DialogDescription>
                Configure the approval stages and required roles for content approval
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="name">Workflow Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Standard Project Approval"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the purpose of this workflow"
                />
              </div>

              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select
                  value={formData.contentType}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, contentType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-semibold mb-4">Approval Stages</h3>
                
                {formData.stages.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.stages.map((stage, index) => (
                      <Card key={index}>
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">Stage {stage.stageOrder}</Badge>
                                <span className="font-semibold">{stage.stageName}</span>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {stage.description || 'No description'}
                              </p>
                              <div className="flex gap-2 flex-wrap">
                                {stage.requiredRoles.map(role => (
                                  <Badge key={role} variant="secondary">
                                    {role}
                                  </Badge>
                                ))}
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                {stage.requireAll ? 'All roles must approve' : 'Any one role can approve'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveStage(index)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Card className="border-dashed">
                  <CardHeader>
                    <CardTitle className="text-sm">Add New Stage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="stageName">Stage Name</Label>
                        <Input
                          id="stageName"
                          value={stageForm.stageName}
                          onChange={(e) => setStageForm(prev => ({ ...prev, stageName: e.target.value }))}
                          placeholder="e.g., Faculty Review"
                        />
                      </div>
                      <div>
                        <Label htmlFor="stageOrder">Stage Order</Label>
                        <Input
                          id="stageOrder"
                          type="number"
                          value={stageForm.stageOrder}
                          onChange={(e) => setStageForm(prev => ({ ...prev, stageOrder: parseInt(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Required Roles</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {roleOptions.map(role => (
                          <div key={role} className="flex items-center space-x-2">
                            <Checkbox
                              id={role}
                              checked={stageForm.requiredRoles.includes(role)}
                              onCheckedChange={() => handleRoleToggle(role)}
                            />
                            <label
                              htmlFor={role}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                            >
                              {role.replace('_', ' ')}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="requireAll"
                        checked={stageForm.requireAll}
                        onCheckedChange={(checked) => setStageForm(prev => ({ ...prev, requireAll: checked }))}
                      />
                      <Label htmlFor="requireAll">Require all roles to approve</Label>
                    </div>

                    <div>
                      <Label htmlFor="stageDescription">Description (Optional)</Label>
                      <Textarea
                        id="stageDescription"
                        value={stageForm.description}
                        onChange={(e) => setStageForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe what happens in this stage"
                      />
                    </div>

                    <Button onClick={handleAddStage} variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Stage
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  {editingWorkflow ? 'Update' : 'Create'} Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Settings className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No workflows configured yet</p>
              <p className="text-sm text-muted-foreground">Create your first approval workflow to get started</p>
            </CardContent>
          </Card>
        ) : (
          workflows.map(workflow => (
            <Card key={workflow._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>{workflow.name}</CardTitle>
                      <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="outline">{workflow.contentType}</Badge>
                    </div>
                    <CardDescription>{workflow.description}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleActive(workflow._id)}
                    >
                      {workflow.isActive ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(workflow)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(workflow._id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">Approval Stages:</h4>
                  {workflow.stages.map((stage, index) => (
                    <div key={index} className="flex items-start gap-3 pl-4 border-l-2">
                      <Badge variant="outline" className="mt-1">
                        {stage.stageOrder}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{stage.stageName}</p>
                        {stage.description && (
                          <p className="text-sm text-muted-foreground">{stage.description}</p>
                        )}
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {stage.requiredRoles.map(role => (
                            <Badge key={role} variant="secondary" className="text-xs">
                              {role}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stage.requireAll ? '✓ All roles required' : '○ Any one role'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
