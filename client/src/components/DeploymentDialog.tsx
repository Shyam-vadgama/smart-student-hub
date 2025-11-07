import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github, Loader2, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface DeploymentDialogProps {
  open: boolean;
  onClose: () => void;
  project: any;
}

const DeploymentDialog: React.FC<DeploymentDialogProps> = ({ open, onClose, project }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [repositoryOption, setRepositoryOption] = useState<'new' | 'existing'>('new');
  const [repositoryName, setRepositoryName] = useState(
    project?.name?.toLowerCase().replace(/\s+/g, '-') || ''
  );
  const [selectedRepo, setSelectedRepo] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<'idle' | 'checking' | 'pushing' | 'deploying' | 'success' | 'failed'>('idle');
  const [deploymentMessage, setDeploymentMessage] = useState('');

  // Check integration status
  const { data: integrationStatus } = useQuery({
    queryKey: ['/api/integrations/status'],
    queryFn: () => apiRequest('GET', '/api/integrations/status').then(res => res.json()),
    enabled: open
  });

  // Fetch GitHub repos
  const { data: githubRepos, isLoading: loadingRepos } = useQuery({
    queryKey: ['/api/integrations/github/repos'],
    queryFn: () => apiRequest('GET', '/api/integrations/github/repos').then(res => res.json()),
    enabled: open && integrationStatus?.integrations?.github?.connected,
    retry: false
  });

  // Deploy mutation
  const deployMutation = useMutation({
    mutationFn: async (deployData: any) => {
      setDeploymentStep('checking');
      setDeploymentMessage('Checking GitHub connection...');
      
      const response = await apiRequest('POST', `/api/projects/deploy/${project._id}`, deployData);
      return response.json();
    },
    onSuccess: (data) => {
      setDeploymentStep('success');
      setDeploymentMessage('Project deployed successfully!');
      toast({ 
        title: '🎉 Deployment Successful!', 
        description: `Your project is now live on GitHub and Vercel.` 
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/user'] });
      
      setTimeout(() => {
        onClose();
        resetDialog();
      }, 3000);
    },
    onError: (error: any) => {
      setDeploymentStep('failed');
      setDeploymentMessage(error.message || 'Deployment failed');
      toast({ 
        title: 'Deployment Failed', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const resetDialog = () => {
    setRepositoryOption('new');
    setRepositoryName(project?.name?.toLowerCase().replace(/\s+/g, '-') || '');
    setSelectedRepo('');
    setIsPrivate(false);
    setDeploymentStep('idle');
    setDeploymentMessage('');
  };

  const handleDeploy = () => {
    if (repositoryOption === 'new' && !repositoryName.trim()) {
      toast({ 
        title: 'Repository name required', 
        description: 'Please enter a name for your new repository',
        variant: 'destructive' 
      });
      return;
    }

    if (repositoryOption === 'existing' && !selectedRepo) {
      toast({ 
        title: 'Repository selection required', 
        description: 'Please select an existing repository',
        variant: 'destructive' 
      });
      return;
    }

    const deployData = {
      repositoryOption,
      repositoryName: repositoryOption === 'new' ? repositoryName : undefined,
      existingRepoFullName: repositoryOption === 'existing' ? selectedRepo : undefined,
      isPrivate: repositoryOption === 'new' ? isPrivate : undefined
    };

    deployMutation.mutate(deployData);
  };

  const isGithubConnected = integrationStatus?.integrations?.github?.connected;
  const isVercelConnected = integrationStatus?.integrations?.vercel?.connected;
  const canDeploy = isGithubConnected; // Only GitHub is required, Vercel is optional

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Github className="h-5 w-5" />
            Deploy to GitHub + Vercel
          </DialogTitle>
          <DialogDescription>
            Deploy "{project?.name}" to your GitHub repository and Vercel hosting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Connection Status Alert */}
          {!isGithubConnected && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>GitHub Required:</strong> You need to connect your GitHub account before deploying.
                <br />
                <a href="/settings" className="text-blue-600 hover:underline mt-2 inline-block">
                  Go to Settings →
                </a>
              </AlertDescription>
            </Alert>
          )}
          {isGithubConnected && !isVercelConnected && (
            <Alert>
              <AlertDescription>
                <strong>Note:</strong> GitHub is connected! Your code will be pushed to GitHub. 
                Vercel deployment will be skipped (connect Vercel for automatic hosting).
              </AlertDescription>
            </Alert>
          )}

          {/* Deployment Progress */}
          {deploymentStep !== 'idle' && (
            <Alert variant={deploymentStep === 'success' ? 'default' : deploymentStep === 'failed' ? 'destructive' : 'default'}>
              <div className="flex items-center gap-3">
                {deploymentStep === 'success' && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {deploymentStep === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                {!['success', 'failed'].includes(deploymentStep) && <Loader2 className="h-5 w-5 animate-spin" />}
                <div>
                  <p className="font-semibold">
                    {deploymentStep === 'checking' && 'Checking connections...'}
                    {deploymentStep === 'pushing' && 'Pushing code to GitHub...'}
                    {deploymentStep === 'deploying' && 'Deploying to Vercel...'}
                    {deploymentStep === 'success' && 'Deployment Complete!'}
                    {deploymentStep === 'failed' && 'Deployment Failed'}
                  </p>
                  <p className="text-sm text-gray-600">{deploymentMessage}</p>
                </div>
              </div>
            </Alert>
          )}

          {canDeploy && deploymentStep === 'idle' && (
            <>
              {/* Repository Selection */}
              <div className="space-y-4">
                <Label>GitHub Repository</Label>
                <RadioGroup value={repositoryOption} onValueChange={(value: any) => setRepositoryOption(value)}>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="new" id="new" />
                    <Label htmlFor="new" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Create New Repository</p>
                        <p className="text-sm text-gray-600">Create a new GitHub repository for this project</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-gray-50">
                    <RadioGroupItem value="existing" id="existing" />
                    <Label htmlFor="existing" className="flex-1 cursor-pointer">
                      <div>
                        <p className="font-semibold">Use Existing Repository</p>
                        <p className="text-sm text-gray-600">Push to an existing GitHub repository</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* New Repository Options */}
              {repositoryOption === 'new' && (
                <div className="space-y-4 pl-4 border-l-2 border-blue-500">
                  <div>
                    <Label htmlFor="repoName">Repository Name *</Label>
                    <Input
                      id="repoName"
                      value={repositoryName}
                      onChange={(e) => setRepositoryName(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="my-awesome-project"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Only lowercase letters, numbers, and hyphens allowed
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="private">Private Repository</Label>
                      <p className="text-sm text-gray-600">Make this repository private</p>
                    </div>
                    <Switch
                      id="private"
                      checked={isPrivate}
                      onCheckedChange={setIsPrivate}
                    />
                  </div>
                </div>
              )}

              {/* Existing Repository Selection */}
              {repositoryOption === 'existing' && (
                <div className="pl-4 border-l-2 border-blue-500">
                  <Label htmlFor="existingRepo">Select Repository *</Label>
                  {loadingRepos ? (
                    <div className="flex items-center gap-2 mt-2 text-gray-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading repositories...
                    </div>
                  ) : githubRepos?.repositories?.length > 0 ? (
                    <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Choose a repository" />
                      </SelectTrigger>
                      <SelectContent>
                        {githubRepos.repositories.map((repo: any) => (
                          <SelectItem key={repo.id} value={repo.full_name}>
                            <div className="flex items-center gap-2">
                              <Github className="h-4 w-4" />
                              <span>{repo.full_name}</span>
                              {repo.private && <span className="text-xs text-gray-500">(Private)</span>}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Alert className="mt-2">
                      <AlertDescription>
                        No repositories found. Create a new repository instead.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              {/* Deployment Info */}
              <Alert>
                <AlertDescription className="text-sm">
                  <strong>What happens next:</strong>
                  <ol className="list-decimal ml-4 mt-2 space-y-1">
                    <li>Your project files will be extracted from the ZIP</li>
                    <li>Code will be pushed to the selected GitHub repository</li>
                    {isVercelConnected ? (
                      <>
                        <li>Vercel will automatically deploy from the GitHub repo</li>
                        <li>You'll receive a live URL for your project</li>
                      </>
                    ) : (
                      <li>Your code will be available on GitHub (Vercel deployment skipped)</li>
                    )}
                  </ol>
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              onClose();
              resetDialog();
            }}
            disabled={deployMutation.isPending}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeploy}
            disabled={!canDeploy || deployMutation.isPending || deploymentStep !== 'idle'}
          >
            {deployMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <Github className="h-4 w-4 mr-2" />
                Deploy Project
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentDialog;
