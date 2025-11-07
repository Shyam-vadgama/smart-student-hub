import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, FileText, Award, FileCode, GraduationCap, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ApprovalRequest {
  _id: string;
  student: {
    _id: string;
    name: string;
    email: string;
  };
  contentType: string;
  contentId: string;
  workflow: {
    _id: string;
    name: string;
  };
  currentStage: number;
  overallStatus: string;
  stages: any[];
  requestedAt: string;
  completedAt?: string;
}

export default function ApprovalRequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionComments, setActionComments] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterContentType, setFilterContentType] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterContentType]);

  const fetchRequests = async () => {
    try {
      let url = '/api/approval-requests?';
      if (filterStatus !== 'all') url += `status=${filterStatus}&`;
      if (filterContentType !== 'all') url += `contentType=${filterContentType}`;

      const response = await fetch(url, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch approval requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (requestId: string) => {
    try {
      const response = await fetch(`/api/approval-requests/${requestId}`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRequest(data);
        setIsDialogOpen(true);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch request details',
        variant: 'destructive'
      });
    }
  };

  const handleAction = async (action: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(`/api/approval-requests/${selectedRequest._id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action,
          comments: actionComments
        })
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: `Request ${action} successfully`
        });
        setIsDialogOpen(false);
        setActionComments('');
        fetchRequests();
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process action',
        variant: 'destructive'
      });
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'project':
        return <FileCode className="h-5 w-5" />;
      case 'achievement':
        return <Award className="h-5 w-5" />;
      case 'resume':
        return <FileText className="h-5 w-5" />;
      case 'marks':
        return <GraduationCap className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
      in_progress: { variant: 'default', icon: <Clock className="h-3 w-3 mr-1" /> },
      approved: { variant: 'default', icon: <CheckCircle className="h-3 w-3 mr-1" />, className: 'bg-green-500' },
      rejected: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> }
    };

    const config = variants[status] || variants.pending;

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.icon}
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const canUserApprove = (request: ApprovalRequest) => {
    if (!user || request.overallStatus !== 'pending' && request.overallStatus !== 'in_progress') {
      return false;
    }

    const currentStage = request.stages[request.currentStage];
    if (!currentStage || currentStage.status !== 'pending') {
      return false;
    }

    // Check if user's role is required for this stage
    if (!currentStage.requiredRoles.includes(user.role)) {
      return false;
    }

    // Check if user has already acted
    const hasActed = currentStage.actions.some((action: any) => 
      action.approver._id === user._id
    );

    return !hasActed;
  };

  const filteredRequests = requests.filter(req => {
    if (user?.role === 'student') return true;
    return canUserApprove(req) || req.overallStatus === 'pending' || req.overallStatus === 'in_progress';
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Approval Requests</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'student' 
            ? 'Track the status of your approval requests'
            : 'Review and approve student content submissions'}
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-48">
          <Select value={filterContentType} onValueChange={setFilterContentType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="project">Projects</SelectItem>
              <SelectItem value="achievement">Achievements</SelectItem>
              <SelectItem value="resume">Resumes</SelectItem>
              <SelectItem value="marks">Marks</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredRequests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No approval requests found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map(request => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getContentIcon(request.contentType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg capitalize">
                          {request.contentType} Approval
                        </CardTitle>
                        {getStatusBadge(request.overallStatus)}
                      </div>
                      <CardDescription>
                        {user?.role !== 'student' && (
                          <>
                            Student: <span className="font-medium">{request.student.name}</span> ({request.student.email})
                            <br />
                          </>
                        )}
                        Workflow: {request.workflow.name}
                        <br />
                        Requested: {new Date(request.requestedAt).toLocaleDateString()}
                        {request.completedAt && (
                          <>
                            <br />
                            Completed: {new Date(request.completedAt).toLocaleDateString()}
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(request._id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <div className="flex-1 flex gap-1">
                    {request.stages.map((stage, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-2 rounded ${
                          stage.status === 'approved'
                            ? 'bg-green-500'
                            : stage.status === 'rejected'
                            ? 'bg-red-500'
                            : index === request.currentStage
                            ? 'bg-blue-500'
                            : 'bg-gray-200'
                        }`}
                        title={stage.stageName}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Stage {request.currentStage + 1}/{request.stages.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Approval Request Details</DialogTitle>
            <DialogDescription>
              Review the approval stages and take action
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Student</Label>
                  <p className="font-medium">{selectedRequest.student.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.student.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Content Type</Label>
                  <p className="font-medium capitalize">{selectedRequest.contentType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Workflow</Label>
                  <p className="font-medium">{selectedRequest.workflow.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedRequest.overallStatus)}</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Approval Stages</h3>
                <div className="space-y-4">
                  {selectedRequest.stages.map((stage, index) => (
                    <Card key={index} className={index === selectedRequest.currentStage ? 'border-blue-500' : ''}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">Stage {stage.stageOrder}</Badge>
                              <span className="font-semibold">{stage.stageName}</span>
                              {getStatusBadge(stage.status)}
                            </div>
                            {stage.description && (
                              <p className="text-sm text-muted-foreground">{stage.description}</p>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <Label className="text-sm">Required Roles:</Label>
                            <div className="flex gap-2 mt-1">
                              {stage.requiredRoles.map((role: string) => (
                                <Badge key={role} variant="secondary" className="text-xs">
                                  {role}
                                </Badge>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {stage.requireAll ? 'All roles must approve' : 'Any one role can approve'}
                            </p>
                          </div>

                          {stage.actions.length > 0 && (
                            <div className="mt-3">
                              <Label className="text-sm">Actions:</Label>
                              <div className="space-y-2 mt-2">
                                {stage.actions.map((action: any, actionIndex: number) => (
                                  <div key={actionIndex} className="flex items-start gap-2 text-sm border-l-2 pl-3">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{action.approver.name}</span>
                                        <Badge variant="outline" className="text-xs">
                                          {action.approverRole}
                                        </Badge>
                                        {action.action === 'approved' ? (
                                          <CheckCircle className="h-4 w-4 text-green-500" />
                                        ) : (
                                          <XCircle className="h-4 w-4 text-red-500" />
                                        )}
                                      </div>
                                      {action.comments && (
                                        <p className="text-muted-foreground mt-1">{action.comments}</p>
                                      )}
                                      <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(action.actionDate).toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {user?.role !== 'student' && canUserApprove(selectedRequest) && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      value={actionComments}
                      onChange={(e) => setActionComments(e.target.value)}
                      placeholder="Add any comments about your decision"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="destructive"
                      onClick={() => handleAction('rejected')}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleAction('approved')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
