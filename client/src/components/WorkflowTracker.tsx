import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface WorkflowTrackerProps {
  contentType?: 'project' | 'achievement' | 'resume' | 'marks' | 'all';
}

const WorkflowTracker: React.FC<WorkflowTrackerProps> = ({ contentType }) => {
  // Fetch approval requests
  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/approval-requests', contentType],
    queryFn: () => {
      const url = contentType 
        ? `/api/approval-requests?contentType=${contentType}`
        : '/api/approval-requests';
      return apiRequest('GET', url).then(res => res.json());
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      pending: { color: 'bg-yellow-500', text: 'Pending' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' },
    };
    const { color, text } = config[status] || config.pending;
    return <Badge className={color}>{text}</Badge>;
  };

  const getStageProgress = (request: any) => {
    if (!request.workflow?.stages) return 0;
    const totalStages = request.workflow.stages.length;
    const currentStageIndex = request.workflow.stages.findIndex(
      (s: any) => s.stageOrder === request.currentStage
    );
    return ((currentStageIndex + 1) / totalStages) * 100;
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading workflows...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Approval Workflow Status</h3>
        <Badge variant="outline">{requests.length} Items</Badge>
      </div>

      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>No approval requests found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request: any) => (
            <Card key={request._id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <CardTitle className="text-base">
                        {request.contentType.charAt(0).toUpperCase() + request.contentType.slice(1)} Approval
                      </CardTitle>
                      <p className="text-sm text-gray-600">
                        Submitted: {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(request.status)}
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">
                      Stage {request.currentStage} of {request.workflow?.stages?.length || 0}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        request.status === 'approved' ? 'bg-green-500' :
                        request.status === 'rejected' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ width: `${getStageProgress(request)}%` }}
                    />
                  </div>
                </div>

                {/* Workflow Stages */}
                {request.workflow?.stages && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold mb-2">Workflow Stages:</p>
                    <div className="space-y-2">
                      {request.workflow.stages.map((stage: any, index: number) => {
                        const isCompleted = stage.stageOrder < request.currentStage;
                        const isCurrent = stage.stageOrder === request.currentStage;
                        const isPending = stage.stageOrder > request.currentStage;

                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-2 rounded ${
                              isCurrent ? 'bg-blue-50 border border-blue-200' :
                              isCompleted ? 'bg-green-50' :
                              'bg-gray-50'
                            }`}
                          >
                            <div className="flex-shrink-0">
                              {isCompleted && <CheckCircle className="h-4 w-4 text-green-500" />}
                              {isCurrent && <Clock className="h-4 w-4 text-blue-500" />}
                              {isPending && <div className="h-4 w-4 rounded-full border-2 border-gray-300" />}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{stage.stageName}</p>
                              <p className="text-xs text-gray-600">
                                {stage.requiredRoles.join(', ')}
                              </p>
                            </div>
                            {isCurrent && (
                              <Badge variant="outline" className="text-xs">Current</Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Approvals */}
                {request.approvals && request.approvals.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-semibold mb-2">Approval History:</p>
                    <div className="space-y-2">
                      {request.approvals.map((approval: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {approval.status === 'approved' ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{approval.approverRole}</span>
                          <span className="text-gray-600">
                            {approval.status === 'approved' ? 'approved' : 'rejected'}
                          </span>
                          <span className="text-gray-500 text-xs">
                            {new Date(approval.timestamp).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {request.comments && (
                  <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                    <p className="font-semibold mb-1">Comments:</p>
                    <p className="text-gray-700">{request.comments}</p>
                  </div>
                )}

                {/* Rejection Reason */}
                {request.status === 'rejected' && request.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="font-semibold text-red-900 mb-1">Rejection Reason:</p>
                    <p className="text-red-800">{request.rejectionReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkflowTracker;
