import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plug,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  XCircle,
  RefreshCw,
  Key,
  Globe,
  Database,
  Calendar,
  Users,
  BookOpen,
  ClipboardCheck,
  FileText,
  AlertCircle,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  _id: string;
  name: string;
  type: string;
  baseUrl: string;
  apiKey?: string;
  authType: 'api-key' | 'bearer' | 'basic' | 'oauth';
  headers?: Record<string, string>;
  endpoints: {
    attendance?: string;
    marks?: string;
    timetable?: string;
    students?: string;
    faculty?: string;
    subjects?: string;
  };
  enabled: boolean;
  syncInterval: number; // in minutes
  lastSync?: Date;
  status: 'active' | 'inactive' | 'error';
  createdAt: Date;
}

const INTEGRATION_TYPES = [
  { value: 'attendance', label: 'Attendance System', icon: ClipboardCheck, color: 'text-green-600' },
  { value: 'marks', label: 'Marks/Exam System', icon: FileText, color: 'text-blue-600' },
  { value: 'timetable', label: 'Timetable System', icon: Calendar, color: 'text-purple-600' },
  { value: 'student-management', label: 'Student Management', icon: Users, color: 'text-orange-600' },
  { value: 'lms', label: 'Learning Management System', icon: BookOpen, color: 'text-indigo-600' },
  { value: 'custom', label: 'Custom Integration', icon: Database, color: 'text-gray-600' },
];

const AUTH_TYPES = [
  { value: 'api-key', label: 'API Key' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'oauth', label: 'OAuth 2.0' },
];

export default function ThirdPartyIntegrations() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingIntegration, setEditingIntegration] = useState<Integration | null>(null);
  const [testingIntegration, setTestingIntegration] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom',
    baseUrl: '',
    apiKey: '',
    authType: 'api-key' as const,
    headers: '{}',
    endpoints: {
      attendance: '',
      marks: '',
      timetable: '',
      students: '',
      faculty: '',
      subjects: '',
    },
    enabled: true,
    syncInterval: 60,
  });

  // Fetch integrations
  const { data: integrations, isLoading } = useQuery<Integration[]>({
    queryKey: ['/api/third-party-integrations'],
    queryFn: () => apiRequest('GET', '/api/third-party-integrations').then(res => res.json()),
    enabled: !!user && (user.role === 'principal' || user.role === 'shiksan_mantri'),
  });

  // Create integration mutation
  const createIntegration = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/third-party-integrations', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/third-party-integrations'] });
      toast({ title: 'Integration created successfully!' });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error creating integration', description: error.message, variant: 'destructive' });
    },
  });

  // Update integration mutation
  const updateIntegration = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      apiRequest('PUT', `/api/third-party-integrations/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/third-party-integrations'] });
      toast({ title: 'Integration updated successfully!' });
      setEditingIntegration(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ title: 'Error updating integration', description: error.message, variant: 'destructive' });
    },
  });

  // Delete integration mutation
  const deleteIntegration = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/third-party-integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/third-party-integrations'] });
      toast({ title: 'Integration deleted successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting integration', description: error.message, variant: 'destructive' });
    },
  });

  // Test connection mutation
  const testConnection = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/third-party-integrations/${id}/test`),
    onSuccess: (response: any) => {
      toast({ 
        title: 'Connection successful!', 
        description: 'The integration is working correctly.',
      });
      setTestingIntegration(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Connection failed', 
        description: error.message, 
        variant: 'destructive' 
      });
      setTestingIntegration(null);
    },
  });

  // Sync data mutation
  const syncData = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/third-party-integrations/${id}/sync`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/third-party-integrations'] });
      toast({ title: 'Data sync initiated successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error syncing data', description: error.message, variant: 'destructive' });
    },
  });

  // Toggle integration status
  const toggleIntegration = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      apiRequest('PATCH', `/api/third-party-integrations/${id}/toggle`, { enabled }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/third-party-integrations'] });
      toast({ title: 'Integration status updated!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating status', description: error.message, variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'custom',
      baseUrl: '',
      apiKey: '',
      authType: 'api-key',
      headers: '{}',
      endpoints: {
        attendance: '',
        marks: '',
        timetable: '',
        students: '',
        faculty: '',
        subjects: '',
      },
      enabled: true,
      syncInterval: 60,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const headers = JSON.parse(formData.headers);
      const data = {
        ...formData,
        headers,
      };

      if (editingIntegration) {
        updateIntegration.mutate({ id: editingIntegration._id, data });
      } else {
        createIntegration.mutate(data);
      }
    } catch (error) {
      toast({ 
        title: 'Invalid JSON', 
        description: 'Please check the headers JSON format', 
        variant: 'destructive' 
      });
    }
  };

  const handleEdit = (integration: Integration) => {
    setEditingIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      baseUrl: integration.baseUrl,
      apiKey: integration.apiKey || '',
      authType: integration.authType,
      headers: JSON.stringify(integration.headers || {}, null, 2),
      endpoints: integration.endpoints,
      enabled: integration.enabled,
      syncInterval: integration.syncInterval,
    });
    setIsAddDialogOpen(true);
  };

  const handleTestConnection = (id: string) => {
    setTestingIntegration(id);
    testConnection.mutate(id);
  };

  if (!user || (user.role !== 'principal' && user.role !== 'shiksan_mantri')) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Third-Party Integrations</h2>
          <p className="text-gray-600 mt-1">Connect your existing systems to Smart Student Hub</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingIntegration(null); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingIntegration ? 'Edit Integration' : 'Add New Integration'}
              </DialogTitle>
              <DialogDescription>
                Configure your third-party service connection
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Integration Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., College ERP System"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Integration Type *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTEGRATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* API Configuration */}
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL *</Label>
                <Input
                  id="baseUrl"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="authType">Authentication Type *</Label>
                  <Select value={formData.authType} onValueChange={(value: any) => setFormData({ ...formData, authType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key / Token</Label>
                  <Input
                    id="apiKey"
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter your API key"
                  />
                </div>
              </div>

              {/* Custom Headers */}
              <div className="space-y-2">
                <Label htmlFor="headers">Custom Headers (JSON)</Label>
                <Textarea
                  id="headers"
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  placeholder='{"Content-Type": "application/json"}'
                  rows={3}
                />
              </div>

              {/* Endpoints */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">API Endpoints</Label>
                <p className="text-sm text-gray-600">Configure endpoints for different data types</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="space-y-1">
                    <Label htmlFor="attendance" className="text-sm">Attendance</Label>
                    <Input
                      id="attendance"
                      value={formData.endpoints.attendance}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, attendance: e.target.value }
                      })}
                      placeholder="/attendance"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="marks" className="text-sm">Marks</Label>
                    <Input
                      id="marks"
                      value={formData.endpoints.marks}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, marks: e.target.value }
                      })}
                      placeholder="/marks"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="timetable" className="text-sm">Timetable</Label>
                    <Input
                      id="timetable"
                      value={formData.endpoints.timetable}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, timetable: e.target.value }
                      })}
                      placeholder="/timetable"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="students" className="text-sm">Students</Label>
                    <Input
                      id="students"
                      value={formData.endpoints.students}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, students: e.target.value }
                      })}
                      placeholder="/students"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="faculty" className="text-sm">Faculty</Label>
                    <Input
                      id="faculty"
                      value={formData.endpoints.faculty}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, faculty: e.target.value }
                      })}
                      placeholder="/faculty"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="subjects" className="text-sm">Subjects</Label>
                    <Input
                      id="subjects"
                      value={formData.endpoints.subjects}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        endpoints: { ...formData.endpoints, subjects: e.target.value }
                      })}
                      placeholder="/subjects"
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="syncInterval">Sync Interval (minutes)</Label>
                  <Input
                    id="syncInterval"
                    type="number"
                    value={formData.syncInterval}
                    onChange={(e) => setFormData({ ...formData, syncInterval: parseInt(e.target.value) })}
                    min="5"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="enabled"
                    checked={formData.enabled}
                    onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
                  />
                  <Label htmlFor="enabled">Enable Integration</Label>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createIntegration.isPending || updateIntegration.isPending}>
                  {(createIntegration.isPending || updateIntegration.isPending) ? 'Saving...' : 'Save Integration'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Integration Cards */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading integrations...</p>
        </div>
      ) : integrations && integrations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const integType = INTEGRATION_TYPES.find(t => t.value === integration.type);
            const Icon = integType?.icon || Database;
            
            return (
              <Card key={integration._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", 
                        integration.status === 'active' ? "bg-green-100" : 
                        integration.status === 'error' ? "bg-red-100" : "bg-gray-100"
                      )}>
                        <Icon className={cn("h-5 w-5", integType?.color || "text-gray-600")} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{integration.name}</CardTitle>
                        <CardDescription className="text-xs">{integType?.label}</CardDescription>
                      </div>
                    </div>
                    <Badge className={cn(
                      integration.status === 'active' ? "bg-green-100 text-green-800" :
                      integration.status === 'error' ? "bg-red-100 text-red-800" :
                      "bg-gray-100 text-gray-800"
                    )}>
                      {integration.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4" />
                    <span className="truncate">{integration.baseUrl}</span>
                  </div>
                  
                  {integration.lastSync && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RefreshCw className="h-4 w-4" />
                      <span>Last sync: {new Date(integration.lastSync).toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={integration.enabled}
                        onCheckedChange={(checked) => 
                          toggleIntegration.mutate({ id: integration._id, enabled: checked })
                        }
                      />
                      <span className="text-sm text-gray-600">
                        {integration.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTestConnection(integration._id)}
                      disabled={testingIntegration === integration._id}
                    >
                      {testingIntegration === integration._id ? (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                          Testing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-3 w-3 mr-1" />
                          Test
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => syncData.mutate(integration._id)}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sync
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(integration)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this integration?')) {
                          deleteIntegration.mutate(integration._id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Plug className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Integrations Yet</h3>
            <p className="text-gray-600 text-center mb-4">
              Connect your existing systems to sync data automatically
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Integration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            Integration Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-700">
          <p>• <strong>API Key Security:</strong> Your API keys are encrypted and stored securely.</p>
          <p>• <strong>Data Sync:</strong> Data is synced based on the interval you set (minimum 5 minutes).</p>
          <p>• <strong>Endpoints:</strong> Configure only the endpoints you need. Leave others empty if not required.</p>
          <p>• <strong>Testing:</strong> Always test the connection before enabling an integration.</p>
          <p>• <strong>Webhooks:</strong> For real-time updates, configure webhooks in your external system to: <code className="bg-white px-2 py-1 rounded">/api/webhooks/integrations</code></p>
        </CardContent>
      </Card>
    </div>
  );
}
