import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { FileText, Eye, Send, Download, Trash2, Edit } from 'lucide-react';
import NAACReportForm from './NAACReportForm';
import NAACReportView from './NAACReportView';

const NAACReportList: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['/api/naac-reports'],
    queryFn: () => apiRequest('GET', '/api/naac-reports').then(res => res.json()),
  });

  // Submit to Principal mutation
  const submitMutation = useMutation({
    mutationFn: async (reportId: string) => {
      const response = await apiRequest('POST', `/api/naac-reports/${reportId}/submit`, {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: '✅ Report submitted to Principal!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error submitting report', description: error.message, variant: 'destructive' });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (reportId: string) => {
      await apiRequest('DELETE', `/api/naac-reports/${reportId}`, {});
    },
    onSuccess: () => {
      toast({ title: '✅ Report deleted successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/naac-reports'] });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting report', description: error.message, variant: 'destructive' });
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

  if (isLoading) {
    return <div className="text-center py-8">Loading reports...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">NAAC/NBA Reports</h3>
        <Button size="sm" onClick={() => setShowCreateForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create New Report
        </Button>
      </div>

      {/* Create Form Dialog */}
      {showCreateForm && (
        <NAACReportForm onClose={() => setShowCreateForm(false)} />
      )}

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

      {/* Reports List */}
      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg font-medium mb-2">No Reports Yet</p>
          <p className="text-sm mb-4">Create your first NAAC/NBA report to get started</p>
          <Button onClick={() => setShowCreateForm(true)}>
            Create Report
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report: any) => (
            <Card key={report._id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      {report.reportType.toUpperCase()} Report - {report.academicYear}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Created: {new Date(report.createdAt).toLocaleDateString()}
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
                  {/* View Button */}
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

                  {/* Submit to Principal - Only for draft reports */}
                  {report.status === 'draft' && (
                    <Button 
                      size="sm"
                      onClick={() => submitMutation.mutate(report._id)}
                      disabled={submitMutation.isPending}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit to Principal
                    </Button>
                  )}

                  {/* Download PDF - For approved reports */}
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

                  {/* Delete - Only for draft reports */}
                  {report.status === 'draft' && (
                    <Button 
                      size="sm" 
                      variant="destructive"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this report?')) {
                          deleteMutation.mutate(report._id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
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
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default NAACReportList;
