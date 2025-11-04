import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Github, ExternalLink, Edit, Trash2, CheckCircle, XCircle, Clock, Upload, Link as LinkIcon, Settings } from "lucide-react";
import ProjectUploadForm from './ProjectUploadForm';
import IntegrationSettings from './IntegrationSettings';

interface Project {
  _id: string;
  name: string;
  description: string;
  languages: string[];
  frameworks: string[];
  tags: string[];
  projectType: string;
  collaborators: any[];
  screenshots: string[];
  demoVideoUrl?: string;
  githubRepoUrl?: string;
  vercelUrl?: string;
  deploymentStatus: 'Pending' | 'Deployed' | 'Failed' | 'Not Deployed';
  uploadedBy: any;
  deploymentType: string;
  isVerified: boolean;
  verifiedBy?: any;
  createdAt: string;
}

const ProjectDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadFormOpen, setUploadFormOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch user's projects
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ['/api/projects/user', user?._id],
    queryFn: () => apiRequest('GET', `/api/projects/user/${user?._id}`).then(res => res.json()).then(data => data.projects),
    enabled: !!user?._id
  });

  // Deploy project mutation
  const deployMutation = useMutation({
    mutationFn: (projectId: string) => apiRequest('POST', `/api/projects/deploy/${projectId}`, {}),
    onSuccess: () => {
      toast({ title: '🎉 Project deployed successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/user'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Deployment failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Delete project mutation
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => apiRequest('DELETE', `/api/projects/${projectId}`, {}),
    onSuccess: () => {
      toast({ title: 'Project deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/user'] });
      setDeleteDialogOpen(false);
      setSelectedProject(null);
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error deleting project', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; text: string }> = {
      'Deployed': { variant: 'default', icon: CheckCircle, text: 'Deployed' },
      'Pending': { variant: 'secondary', icon: Clock, text: 'Pending' },
      'Failed': { variant: 'destructive', icon: XCircle, text: 'Failed' },
      'Not Deployed': { variant: 'outline', icon: Upload, text: 'Not Deployed' }
    };

    const config = variants[status] || variants['Not Deployed'];
    const Icon = config.icon;

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1 w-fit">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="projects">My Projects</TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* Projects Tab */}
        <TabsContent value="projects" className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">My Projects</h2>
              <p className="text-gray-600">Manage your portfolio and deployments</p>
            </div>
            <Button onClick={() => setUploadFormOpen(true)} className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload New Project
            </Button>
          </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {projects?.filter(p => p.deploymentStatus === 'Deployed').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {projects?.filter(p => p.isVerified).length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {projects?.filter(p => p.deploymentStatus === 'Pending').length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      {projects && projects.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>All Projects</CardTitle>
            <CardDescription>View and manage your uploaded projects</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Framework</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collaborators</TableHead>
                  <TableHead>Links</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => (
                  <TableRow key={project._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{project.name}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{project.description}</div>
                        {project.isVerified && (
                          <Badge variant="secondary" className="mt-1">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {project.frameworks.slice(0, 2).map(fw => (
                          <Badge key={fw} variant="outline" className="text-xs">{fw}</Badge>
                        ))}
                        {project.frameworks.length > 2 && (
                          <Badge variant="outline" className="text-xs">+{project.frameworks.length - 2}</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{project.projectType}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(project.deploymentStatus)}</TableCell>
                    <TableCell>
                      {project.collaborators.length > 0 ? (
                        <div className="flex -space-x-2">
                          {project.collaborators.slice(0, 3).map((collab, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs border-2 border-white"
                              title={collab.name}
                            >
                              {collab.name?.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {project.collaborators.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-xs border-2 border-white">
                              +{project.collaborators.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {project.githubRepoUrl && (
                          <a
                            href={project.githubRepoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {project.vercelUrl && (
                          <a
                            href={project.vercelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                        {project.demoVideoUrl && (
                          <a
                            href={project.demoVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-red-600 hover:text-red-800"
                          >
                            <LinkIcon className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {project.deploymentType === 'Portfolio + Deploy' && 
                         project.deploymentStatus !== 'Deployed' && 
                         project.deploymentStatus !== 'Pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deployMutation.mutate(project._id)}
                            disabled={deployMutation.isPending}
                          >
                            Deploy
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedProject(project);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Upload className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">Upload your first project to get started!</p>
            <Button onClick={() => setUploadFormOpen(true)}>
              Upload Project
            </Button>
          </CardContent>
        </Card>
      )}

          {/* Upload Form Dialog */}
          <ProjectUploadForm open={uploadFormOpen} onClose={() => setUploadFormOpen(false)} />

          {/* Delete Confirmation Dialog */}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedProject?.name}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => selectedProject && deleteMutation.mutate(selectedProject._id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Integrations Tab */}
        <TabsContent value="integrations" className="space-y-6 mt-6">
          <IntegrationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProjectDashboard;
