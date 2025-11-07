import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Plus, Edit, Trash2, Eye, ToggleLeft, ToggleRight } from 'lucide-react';

const WorkflowManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();
  const [selectedWorkflow, setSelectedWorkflow] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch workflows created by this HOD
  const { data: workflows = [], isLoading, error } = useQuery({
    queryKey: ['/api/approval-workflows'],
    queryFn: async () => {
      try {
        const response = await apiRequest('GET', '/api/approval-workflows');
        const data = await response.json();
        console.log('Workflows loaded:', data);
        return data;
      } catch (err) {
        console.error('Error loading workflows:', err);
        throw err;
      }
    },
  });

  // Toggle workflow active status
  const toggleMutation = useMutation({
    mutationFn: async ({ id }: { id: string; isActive: boolean }) => {
      const response = await apiRequest('PATCH', `/api/approval-workflows/${id}/toggle-active`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Workflow status updated!' });
      queryClient.invalidateQueries({ queryKey: ['/api/approval-workflows'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating workflow', description: error.message, variant: 'destructive' });
    }
  });

  // Delete workflow
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest('DELETE', `/api/approval-workflows/${id}`, {});
    },
    onSuccess: () => {
      toast({ title: '✅ Workflow deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/approval-workflows'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting workflow', description: error.message, variant: 'destructive' });
    }
  });

  const getContentTypeBadge = (type: string) => {
    const colors: any = {
      project: 'bg-blue-500',
      achievement: 'bg-green-500',
      resume: 'bg-purple-500',
      marks: 'bg-orange-500',
      all: 'bg-gray-500'
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-2"></div>
        <p className="text-gray-600">Loading workflows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-red-600 mb-2">Error loading workflows</p>
          <p className="text-sm text-gray-600">{(error as any).message}</p>
          <Button 
            className="mt-4" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/approval-workflows'] })}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Workflows</h3>
          <p className="text-sm text-gray-600">Approval workflows you've created</p>
        </div>
        <Button size="sm" onClick={() => setLocation('/approval-workflows')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Workflow Details Modal */}
      {showDetails && selectedWorkflow && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowDetails(false)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedWorkflow.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowDetails(false)}>✕</Button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Description:</p>
                <p className="text-sm">{selectedWorkflow.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Content Type:</p>
                {getContentTypeBadge(selectedWorkflow.contentType)}
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-2">Status:</p>
                <Badge className={selectedWorkflow.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                  {selectedWorkflow.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div>
                <p className="text-sm font-semibold mb-3">Workflow Stages:</p>
                <div className="space-y-3">
                  {selectedWorkflow.stages?.map((stage: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white font-bold">
                          {stage.stageOrder}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{stage.stageName}</p>
                          <p className="text-xs text-gray-600">
                            Required Roles: {stage.requiredRoles.join(', ')}
                          </p>
                        </div>
                      </div>
                      {stage.description && (
                        <p className="text-sm text-gray-600 ml-11">{stage.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-xs text-gray-500 pt-4 border-t">
                <p>Created: {new Date(selectedWorkflow.createdAt).toLocaleString()}</p>
                {selectedWorkflow.updatedAt && (
                  <p>Last Updated: {new Date(selectedWorkflow.updatedAt).toLocaleString()}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Workflows List */}
      {workflows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <Plus className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium mb-2">No Workflows Created</p>
            <p className="text-sm mb-4">Create your first approval workflow</p>
            <Button onClick={() => setLocation('/approval-workflows')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {workflows.map((workflow: any) => (
            <Card key={workflow._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      {getContentTypeBadge(workflow.contentType)}
                      <Badge className={workflow.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                        {workflow.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{workflow.description}</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {/* Stages Summary */}
                  <div>
                    <p className="text-sm font-semibold mb-2">
                      Stages ({workflow.stages?.length || 0}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {workflow.stages?.map((stage: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                          <span className="font-semibold">{stage.stageOrder}.</span>
                          <span>{stage.stageName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedWorkflow(workflow);
                        setShowDetails(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleMutation.mutate({ 
                        id: workflow._id, 
                        isActive: !workflow.isActive 
                      })}
                      disabled={toggleMutation.isPending}
                    >
                      {workflow.isActive ? (
                        <>
                          <ToggleRight className="h-4 w-4 mr-2" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="h-4 w-4 mr-2" />
                          Activate
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setLocation(`/approval-workflows?edit=${workflow._id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this workflow?')) {
                          deleteMutation.mutate(workflow._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Metadata */}
                  <div className="text-xs text-gray-500 pt-2 border-t">
                    <p>Created: {new Date(workflow.createdAt).toLocaleDateString()}</p>
                    {workflow.department && (
                      <p>Department: {workflow.department.name || 'N/A'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowManagement;
