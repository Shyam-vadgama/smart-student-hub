import React, { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, Github, ExternalLink } from "lucide-react";

interface DeploymentStatusProps {
  projectId: string;
  currentStatus: string;
}

const DeploymentStatus: React.FC<DeploymentStatusProps> = ({ projectId, currentStatus }) => {
  const queryClient = useQueryClient();

  // Poll for project status every 2 seconds if deployment is pending
  const { data: project } = useQuery({
    queryKey: [`/api/projects/${projectId}`],
    queryFn: () => apiRequest('GET', `/api/projects/${projectId}`).then(res => res.json()).then(data => data.project),
    refetchInterval: currentStatus === 'Pending' ? 2000 : false, // Poll every 2 seconds if pending
    enabled: !!projectId
  });

  // Invalidate parent queries when deployment completes
  useEffect(() => {
    if (project && project.deploymentStatus !== 'Pending' && currentStatus === 'Pending') {
      queryClient.invalidateQueries({ queryKey: ['/api/projects/user'] });
    }
  }, [project?.deploymentStatus, currentStatus, queryClient]);

  if (!project || project.deploymentStatus === 'Not Deployed') {
    return null;
  }

  const isPending = project.deploymentStatus === 'Pending';
  const isDeployed = project.deploymentStatus === 'Deployed';
  const isFailed = project.deploymentStatus === 'Failed';

  return (
    <div className="space-y-2">
      {/* Status Badge */}
      <div className="flex items-center gap-2">
        {isPending && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Deploying...
          </Badge>
        )}
        {isDeployed && (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Deployed
          </Badge>
        )}
        {isFailed && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        )}
      </div>

      {/* Progress Bar and Step (only show during deployment) */}
      {isPending && project.deploymentStep && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>{project.deploymentStep}</span>
            <span>{project.deploymentProgress || 0}%</span>
          </div>
          <Progress value={project.deploymentProgress || 0} className="h-2" />
        </div>
      )}

      {/* Deployment Links (show when deployed) */}
      {isDeployed && (
        <div className="flex flex-wrap gap-2">
          {project.githubRepoUrl && (
            <a
              href={project.githubRepoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Github className="h-3 w-3" />
              GitHub
            </a>
          )}
          {project.vercelUrl && (
            <a
              href={`https://${project.vercelUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 hover:text-green-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Live Site
            </a>
          )}
          {project.vercelSettingsUrl && (
            <a
              href={project.vercelSettingsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              ⚙️ Vercel Settings
            </a>
          )}
        </div>
      )}

      {/* Error Message (show if failed) */}
      {isFailed && project.deploymentStep && (
        <p className="text-xs text-red-600">{project.deploymentStep}</p>
      )}
    </div>
  );
};

export default DeploymentStatus;
