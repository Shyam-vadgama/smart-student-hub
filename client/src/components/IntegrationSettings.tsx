import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, ExternalLink, CheckCircle, XCircle, Link as LinkIcon, Unlink } from "lucide-react";

const IntegrationSettings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [githubToken, setGithubToken] = useState('');
  const [vercelToken, setVercelToken] = useState('');
  const [showGithubDialog, setShowGithubDialog] = useState(false);
  const [showVercelDialog, setShowVercelDialog] = useState(false);

  // Fetch integration status
  const { data: integrationStatus, isLoading } = useQuery({
    queryKey: ['/api/integrations/status'],
    queryFn: () => apiRequest('GET', '/api/integrations/status').then(res => res.json())
  });

  // Fetch GitHub repos (only if connected)
  const { data: githubRepos, refetch: refetchGithubRepos } = useQuery({
    queryKey: ['/api/integrations/github/repos'],
    queryFn: () => apiRequest('GET', '/api/integrations/github/repos').then(res => res.json()),
    enabled: integrationStatus?.integrations?.github?.connected || false,
    retry: false
  });

  // Fetch Vercel projects (only if connected)
  const { data: vercelProjects, refetch: refetchVercelProjects } = useQuery({
    queryKey: ['/api/integrations/vercel/projects'],
    queryFn: () => apiRequest('GET', '/api/integrations/vercel/projects').then(res => res.json()),
    enabled: integrationStatus?.integrations?.vercel?.connected || false,
    retry: false
  });

  // Connect GitHub mutation
  const connectGithubMutation = useMutation({
    mutationFn: (token: string) => apiRequest('POST', '/api/integrations/github/connect', { accessToken: token }),
    onSuccess: () => {
      toast({ title: '✅ GitHub connected successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
      refetchGithubRepos();
      setShowGithubDialog(false);
      setGithubToken('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to connect GitHub', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Connect Vercel mutation
  const connectVercelMutation = useMutation({
    mutationFn: (token: string) => apiRequest('POST', '/api/integrations/vercel/connect', { accessToken: token }),
    onSuccess: () => {
      toast({ title: '✅ Vercel connected successfully!' });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
      refetchVercelProjects();
      setShowVercelDialog(false);
      setVercelToken('');
    },
    onError: (error: any) => {
      toast({ 
        title: 'Failed to connect Vercel', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Disconnect GitHub mutation
  const disconnectGithubMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/integrations/github/disconnect', {}),
    onSuccess: () => {
      toast({ title: 'GitHub disconnected' });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error disconnecting GitHub', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  // Disconnect Vercel mutation
  const disconnectVercelMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/integrations/vercel/disconnect', {}),
    onSuccess: () => {
      toast({ title: 'Vercel disconnected' });
      queryClient.invalidateQueries({ queryKey: ['/api/integrations/status'] });
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error disconnecting Vercel', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleConnectGithub = () => {
    if (!githubToken.trim()) {
      toast({ title: 'Please enter a valid GitHub token', variant: 'destructive' });
      return;
    }
    connectGithubMutation.mutate(githubToken);
  };

  const handleConnectVercel = () => {
    if (!vercelToken.trim()) {
      toast({ title: 'Please enter a valid Vercel token', variant: 'destructive' });
      return;
    }
    connectVercelMutation.mutate(vercelToken);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const isGithubConnected = integrationStatus?.integrations?.github?.connected;
  const isVercelConnected = integrationStatus?.integrations?.vercel?.connected;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Integration Settings</h2>
        <p className="text-gray-600">Connect your GitHub and Vercel accounts to enable auto-deployment</p>
      </div>

      {/* Alert for deployment requirement */}
      {(!isGithubConnected || !isVercelConnected) && (
        <Alert>
          <AlertDescription>
            <strong>Note:</strong> To use the "Portfolio + Deploy" feature, you need to connect both GitHub and Vercel accounts.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* GitHub Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Github className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>GitHub</CardTitle>
                  <CardDescription>Connect your GitHub account</CardDescription>
                </div>
              </div>
              {isGithubConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isGithubConnected ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Repositories:</strong> {githubRepos?.repositories?.length || 0} repos found
                  </p>
                  {githubRepos?.repositories && githubRepos.repositories.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {githubRepos.repositories.slice(0, 5).map((repo: any) => (
                        <div key={repo.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                          <span className="font-medium">{repo.name}</span>
                          <a 
                            href={repo.html_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                      {githubRepos.repositories.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{githubRepos.repositories.length - 5} more repositories
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchGithubRepos()}
                    className="flex-1"
                  >
                    Refresh Repos
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => disconnectGithubMutation.mutate()}
                    disabled={disconnectGithubMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Connect your GitHub account to push your projects to repositories and enable version control.
                </p>
                <Button 
                  onClick={() => setShowGithubDialog(true)}
                  className="w-full flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Connect GitHub
                </Button>
                <a 
                  href="https://github.com/settings/tokens/new?scopes=repo,user&description=Smart%20Student%20Hub"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block text-center"
                >
                  Generate GitHub Personal Access Token →
                </a>
              </>
            )}
          </CardContent>
        </Card>

        {/* Vercel Integration Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                  <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0L24 24H0L12 0z" />
                  </svg>
                </div>
                <div>
                  <CardTitle>Vercel</CardTitle>
                  <CardDescription>Connect your Vercel account</CardDescription>
                </div>
              </div>
              {isVercelConnected ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <XCircle className="h-3 w-3" />
                  Not Connected
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isVercelConnected ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    <strong>Projects:</strong> {vercelProjects?.projects?.length || 0} projects found
                  </p>
                  {vercelProjects?.projects && vercelProjects.projects.length > 0 && (
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-1">
                      {vercelProjects.projects.slice(0, 5).map((project: any) => (
                        <div key={project.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded text-sm">
                          <span className="font-medium">{project.name}</span>
                          <a 
                            href={`https://vercel.com/${project.name}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </div>
                      ))}
                      {vercelProjects.projects.length > 5 && (
                        <p className="text-xs text-gray-500 text-center pt-2">
                          +{vercelProjects.projects.length - 5} more projects
                        </p>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => refetchVercelProjects()}
                    className="flex-1"
                  >
                    Refresh Projects
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => disconnectVercelMutation.mutate()}
                    disabled={disconnectVercelMutation.isPending}
                    className="flex items-center gap-1"
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  Connect your Vercel account to automatically deploy your projects to the cloud.
                </p>
                <Button 
                  onClick={() => setShowVercelDialog(true)}
                  className="w-full flex items-center gap-2"
                >
                  <LinkIcon className="h-4 w-4" />
                  Connect Vercel
                </Button>
                <a 
                  href="https://vercel.com/account/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline block text-center"
                >
                  Generate Vercel Access Token →
                </a>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* GitHub Connection Dialog */}
      <Dialog open={showGithubDialog} onOpenChange={setShowGithubDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect GitHub Account</DialogTitle>
            <DialogDescription>
              Enter your GitHub Personal Access Token to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="github-token">GitHub Personal Access Token</Label>
              <Input
                id="github-token"
                type="password"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                value={githubToken}
                onChange={(e) => setGithubToken(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-2">
                Required scopes: <code className="bg-gray-100 px-1 rounded">repo</code>, <code className="bg-gray-100 px-1 rounded">user</code>
              </p>
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                <strong>How to get a token:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Go to GitHub Settings → Developer settings → Personal access tokens</li>
                  <li>Click "Generate new token (classic)"</li>
                  <li>Select scopes: <code>repo</code> and <code>user</code></li>
                  <li>Copy the generated token and paste it here</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGithubDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnectGithub}
              disabled={connectGithubMutation.isPending}
            >
              {connectGithubMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Vercel Connection Dialog */}
      <Dialog open={showVercelDialog} onOpenChange={setShowVercelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Vercel Account</DialogTitle>
            <DialogDescription>
              Enter your Vercel Access Token to connect your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="vercel-token">Vercel Access Token</Label>
              <Input
                id="vercel-token"
                type="password"
                placeholder="Enter your Vercel token"
                value={vercelToken}
                onChange={(e) => setVercelToken(e.target.value)}
                className="mt-2"
              />
            </div>
            <Alert>
              <AlertDescription className="text-xs">
                <strong>How to get a token:</strong>
                <ol className="list-decimal ml-4 mt-2 space-y-1">
                  <li>Go to Vercel Dashboard → Settings → Tokens</li>
                  <li>Click "Create Token"</li>
                  <li>Give it a name and set expiration</li>
                  <li>Copy the generated token and paste it here</li>
                </ol>
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVercelDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnectVercel}
              disabled={connectVercelMutation.isPending}
            >
              {connectVercelMutation.isPending ? 'Connecting...' : 'Connect'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IntegrationSettings;
