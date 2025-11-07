import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, CheckCircle, XCircle, Download, MessageSquare } from 'lucide-react';
import NAACReportView from './NAACReportView';

const PrincipalNAACReportList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['/api/naac-reports'],
    queryFn: () => apiRequest('GET', '/api/naac-reports').then(res => res.json()),
  });

  // Verify mutation
  const verifyMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('POST', `/api/naac-reports/${reportId}/verify`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Report verified successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error verifying report', description: error.message, variant: 'destructive' });
    }
  });

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('POST', `/api/naac-reports/${reportId}/approve`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Report approved successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error approving report', description: error.message, variant: 'destructive' });
    }
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ reportId, reason }: { reportId: string; reason: string }) => {
      const response = await apiRequest('POST', `/api/naac-reports/${reportId}/reject`, { reason });
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Report rejected!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
      setShowRejectDialog(false);
      setRejectionReason('');
      setSelectedReport(null);
    },
    onError: (error: any) => {
      toast({ title: 'Error rejecting report', description: error.message, variant: 'destructive' });
    }
  });

  // Download PDF
  const handleDownloadPDF = async (reportId: string) => {
    try {
      const response = await fetch(`/api/naac-reports/${reportId}/download-pdf`, {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('Failed to download PDF');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NAAC-Report-${reportId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: '✅ PDF downloaded successfully!' });
    } catch (error: any) {
      toast({ title: 'Error downloading PDF', description: error.message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: any = {
      draft: { color: 'bg-gray-500', text: 'Draft' },
      submitted: { color: 'bg-blue-500', text: 'Submitted' },
      verified: { color: 'bg-yellow-500', text: 'Verified' },
      approved: { color: 'bg-green-500', text: 'Approved' },
      rejected: { color: 'bg-red-500', text: 'Rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.draft;
    return <Badge className={config.color}>{config.text}</Badge>;
  };

  // Filter submitted reports (Principal should see submitted, verified, approved, rejected)
  const submittedReports = reports.filter((r: any) => 
    ['submitted', 'verified', 'approved', 'rejected'].includes(r.status)
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">NAAC/NBA Reports - Review & Approval</h3>
          <p className="text-sm text-gray-600">Review reports submitted by HODs</p>
        </div>
      </div>

      {/* View Report Dialog */}
      {showViewDialog && selectedReport && (
        <NAACReportView 
          report={selectedReport} 
          onClose={() => {
            setShowViewDialog(false);
            setSelectedReport(null);
          }}
        />
      )}

      {/* Reject Dialog */}
      {showRejectDialog && selectedReport && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowRejectDialog(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Reject Report</h3>
            <p className="text-sm text-gray-600 mb-4">
              Please provide a reason for rejecting this report:
            </p>
            <textarea
              className="w-full border rounded-md p-2 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason('');
              }}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => {
                  if (!rejectionReason.trim()) {
                    toast({ title: 'Please enter a rejection reason', variant: 'destructive' });
                    return;
                  }
                  rejectMutation.mutate({ 
                    reportId: selectedReport._id, 
                    reason: rejectionReason 
                  });
                }}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? 'Rejecting...' : 'Reject Report'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {submittedReports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No Reports to Review</p>
          <p className="text-sm">Waiting for HODs to submit reports</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {submittedReports.map((report: any) => (
            <Card key={report._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {report.reportType.toUpperCase()} Report - {report.academicYear}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Department: {report.department?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Submitted: {report.submittedAt ? new Date(report.submittedAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                  <div>
                    <p className="text-gray-600">Students</p>
                    <p className="font-semibold">{report.studentData?.totalAdmitted || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Pass Rate</p>
                    <p className="font-semibold">{report.studentData?.passPercentage || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Placement</p>
                    <p className="font-semibold">{report.placementData?.placementPercentage || 0}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Avg Package</p>
                    <p className="font-semibold">₹{report.placementData?.averagePackage || 0} LPA</p>
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
                  {/* View Button - Always available */}
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedReport(report);
                      setShowViewDialog(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>

                  {/* Verify Button - For submitted reports */}
                  {report.status === 'submitted' && (
                    <Button 
                      size="sm"
                      variant="outline"
                      onClick={() => verifyMutation.mutate(report._id)}
                      disabled={verifyMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify
                    </Button>
                  )}

                  {/* Approve Button - For submitted or verified reports */}
                  {(report.status === 'submitted' || report.status === 'verified') && (
                    <Button 
                      size="sm"
                      onClick={() => approveMutation.mutate(report._id)}
                      disabled={approveMutation.isPending}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Approve
                    </Button>
                  )}

                  {/* Reject Button - For submitted or verified reports */}
                  {(report.status === 'submitted' || report.status === 'verified') && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowRejectDialog(true);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject
                    </Button>
                  )}

                  {/* Download PDF - For verified or approved reports */}
                  {(report.status === 'approved' || report.status === 'verified') && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDownloadPDF(report._id)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download PDF
                    </Button>
                  )}
                </div>

                {/* Show rejection reason if rejected */}
                {report.status === 'rejected' && report.rejectionReason && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-semibold text-red-900">Rejection Reason:</p>
                    <p className="text-sm text-red-800">{report.rejectionReason}</p>
                  </div>
                )}

                {/* Show approval info if approved */}
                {report.status === 'approved' && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="text-sm font-semibold text-green-900">✅ Approved</p>
                    <p className="text-sm text-green-800">
                      Approved on: {report.approvedAt ? new Date(report.approvedAt).toLocaleDateString() : 'N/A'}
                    </p>
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

export default PrincipalNAACReportList;
