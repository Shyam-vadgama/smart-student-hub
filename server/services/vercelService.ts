import axios from 'axios';

const VERCEL_API_BASE = 'https://api.vercel.com';

export class VercelService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Get user's projects
  async getProjects() {
    try {
      const response = await axios.get(`${VERCEL_API_BASE}/v9/projects`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      return response.data.projects;
    } catch (error: any) {
      throw new Error(`Failed to fetch Vercel projects: ${error.message}`);
    }
  }

  // Create and deploy a project from GitHub
  async deployFromGitHub(projectName: string, githubRepoUrl: string, framework?: string) {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubRepoUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1].replace('.git', '');

      // Create project
      const projectResponse = await axios.post(
        `${VERCEL_API_BASE}/v9/projects`,
        {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          framework: framework || null,
          gitRepository: {
            type: 'github',
            repo: `${owner}/${repo}`
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const projectId = projectResponse.data.id;

      // Trigger deployment
      const deploymentResponse = await axios.post(
        `${VERCEL_API_BASE}/v13/deployments`,
        {
          name: projectName.toLowerCase().replace(/\s+/g, '-'),
          gitSource: {
            type: 'github',
            repo: `${owner}/${repo}`,
            ref: 'main'
          },
          projectSettings: {
            framework: framework || undefined
          }
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        projectId,
        deploymentId: deploymentResponse.data.id,
        url: deploymentResponse.data.url,
        inspectorUrl: deploymentResponse.data.inspectorUrl
      };
    } catch (error: any) {
      throw new Error(`Failed to deploy to Vercel: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Get deployment status
  async getDeploymentStatus(deploymentId: string) {
    try {
      const response = await axios.get(
        `${VERCEL_API_BASE}/v13/deployments/${deploymentId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        }
      );
      return {
        state: response.data.readyState,
        url: response.data.url,
        status: response.data.status
      };
    } catch (error: any) {
      throw new Error(`Failed to get deployment status: ${error.message}`);
    }
  }

  // Get user info
  async getUserInfo() {
    try {
      const response = await axios.get(`${VERCEL_API_BASE}/v2/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });
      return response.data.user;
    } catch (error: any) {
      throw new Error(`Failed to fetch Vercel user info: ${error.message}`);
    }
  }
}
