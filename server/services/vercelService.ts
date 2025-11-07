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

  // Check if project is HTML/CSS/JS
  private isStaticProject(framework?: string): boolean {
    if (!framework) return false;
    const staticFrameworks = ['html', 'vanilla', 'vanillajs', 'static'];
    return staticFrameworks.includes(framework.toLowerCase());
  }

  // Get Vercel project settings based on framework
  private getVercelSettings(framework?: string) {
    const isStatic = this.isStaticProject(framework);
    
    const settings: any = {
      buildCommand: isStatic ? null : 'npm run build',
      outputDirectory: isStatic ? '.vercel/static' : '.vercel/output',
      framework: isStatic ? null : this.mapToVercelFramework(framework),
      installCommand: isStatic ? null : 'npm install',
      devCommand: isStatic ? null : 'npm run dev',
    };
    
    // Only include these properties for static sites
    if (isStatic) {
      settings.cleanUrls = true;
      settings.trailingSlash = true;
    }

    // Only include public and rewrites for static sites
    if (isStatic) {
      settings.public = true;
      settings.rewrites = [
        { source: '/(.*)', destination: '/index.html' }
      ];
    }
    
    return settings;
  }

  // Create and deploy a project from GitHub
  async deployFromGitHub(projectName: string, githubRepoUrl: string, framework?: string, repoId?: number) {
    try {
      // Extract owner and repo from GitHub URL
      const urlParts = githubRepoUrl.replace('https://github.com/', '').split('/');
      const owner = urlParts[0];
      const repo = urlParts[1].replace('.git', '');
      const cleanProjectName = projectName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const isStatic = this.isStaticProject(framework);

      if (!repoId) {
        throw new Error('Missing GitHub repoId. Please reconnect GitHub in Vercel settings.');
      }

      console.log(`🚀 Creating Vercel project: ${cleanProjectName}`);
      console.log(`📦 GitHub repo: ${owner}/${repo}`);

      // Get user info to get team ID (if any)
      let teamId: string | undefined;
      try {
        const userInfo = await this.getUserInfo();
        // Try to get default team
        const teamsResponse = await axios.get(`${VERCEL_API_BASE}/v2/teams`, {
          headers: { Authorization: `Bearer ${this.token}` }
        });
        if (teamsResponse.data.teams && teamsResponse.data.teams.length > 0) {
          teamId = teamsResponse.data.teams[0].id;
          console.log(`👥 Using team: ${teamId}`);
        }
      } catch (e) {
        console.log('ℹ️ No team found, using personal account');
      }

      // Check if project already exists
      let projectId: string;
      let projectExists = false;
      
      try {
        const existingProjectsResponse = await axios.get(
          `${VERCEL_API_BASE}/v9/projects/${cleanProjectName}`,
          {
            headers: { Authorization: `Bearer ${this.token}` },
            params: teamId ? { teamId } : {}
          }
        );
        projectId = existingProjectsResponse.data.id;
        projectExists = true;
        console.log(`✅ Project already exists: ${projectId}`);
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Project doesn't exist, create it
          console.log('📝 Creating new Vercel project...');
          
          // Get Vercel settings based on project type
          const vercelSettings = this.getVercelSettings(framework);
          
          const createProjectPayload: any = {
            name: cleanProjectName,
            gitRepository: {
              type: 'github',
              repo: `${owner}/${repo}`,
              repoId
            },
            publicSource: false,
            buildCommand: vercelSettings.buildCommand,
            outputDirectory: vercelSettings.outputDirectory,
            installCommand: vercelSettings.installCommand,
            devCommand: vercelSettings.devCommand,
            cleanUrls: vercelSettings.cleanUrls,
            trailingSlash: vercelSettings.trailingSlash,
            rewrites: vercelSettings.rewrites
          };
          
          // Only include public property for static sites
          if (isStatic) {
            createProjectPayload.public = vercelSettings.public;
          }

          // Only add framework if it's a valid Vercel framework and not a static site
          if (vercelSettings.framework) {
            createProjectPayload.framework = vercelSettings.framework;
          }

          const projectResponse = await axios.post(
            `${VERCEL_API_BASE}/v9/projects`,
            createProjectPayload,
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
              },
              params: teamId ? { teamId } : {}
            }
          );

          projectId = projectResponse.data.id;
          console.log(`✅ Created Vercel project: ${projectId}`);
        } else {
          throw error;
        }
      }

      // Link GitHub repository to project if not already linked
      if (!projectExists) {
        try {
          await axios.post(
            `${VERCEL_API_BASE}/v9/projects/${projectId}/link`,
            {
              type: 'github',
              repo: `${owner}/${repo}`,
              repoId,
              gitBranch: 'main'
            },
            {
              headers: {
                Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
              },
              params: teamId ? { teamId } : {}
            }
          );
          console.log('🔗 Linked GitHub repository to Vercel project');
        } catch (linkError: any) {
          console.log('ℹ️ Repository linking skipped:', linkError.response?.data?.error?.message || linkError.message);
        }
      }

      // Trigger deployment
      console.log('🚀 Triggering Vercel deployment...');
      
      const deploymentPayload: any = {
        name: cleanProjectName,
        project: projectId,
        gitSource: {
          type: 'github',
          repo: `${owner}/${repo}`,
          repoId,
          ref: 'main'
        },
        target: 'production'
      };

      // For static sites, we need to ensure the build command is not set
      if (isStatic) {
        delete deploymentPayload.buildCommand;
        // Only include public property for static sites
        deploymentPayload.public = true;
      }

      console.log('Deployment payload:', JSON.stringify(deploymentPayload, null, 2));

      const deploymentResponse = await axios.post(
        `${VERCEL_API_BASE}/v13/deployments`,
        deploymentPayload,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          params: teamId ? { teamId } : {}
        }
      );

      const deploymentUrl = deploymentResponse.data.url;
      const inspectorUrl = deploymentResponse.data.inspectorUrl;
      
      console.log(`✅ Deployment created: https://${deploymentUrl}`);
      console.log(`🔍 Inspector: ${inspectorUrl}`);

      return {
        projectId,
        projectName: cleanProjectName,
        deploymentId: deploymentResponse.data.id,
        url: deploymentUrl,
        inspectorUrl: inspectorUrl,
        settingsUrl: `https://vercel.com/${teamId ? `team/${teamId}/` : ''}${cleanProjectName}/settings`
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      console.error('❌ Vercel deployment error:', errorMessage);
      console.error('Full error:', JSON.stringify(error.response?.data, null, 2));
      throw new Error(`Failed to deploy to Vercel: ${errorMessage}`);
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

  // Map framework names to Vercel-supported values
  private mapToVercelFramework(framework?: string): string | null {
    if (!framework) return null;

    const frameworkMap: { [key: string]: string | null } = {
      // React variants
      'react': 'create-react-app',
      'create-react-app': 'create-react-app',
      'vite': 'vite',
      
      // Next.js
      'next.js': 'nextjs',
      'nextjs': 'nextjs',
      'next': 'nextjs',
      
      // Vue
      'vue': 'vue',
      'vue.js': 'vue',
      'nuxt': 'nuxtjs',
      'nuxt.js': 'nuxtjs',
      'nuxtjs': 'nuxtjs',
      
      // Angular
      'angular': 'angular',
      
      // Svelte
      'svelte': 'svelte',
      'sveltekit': 'sveltekit',
      
      // Static (no framework needed)
      'html': null,
      'static': null,
      'css': null,
      'javascript': null,
      
      // Other
      'gatsby': 'gatsby',
      'remix': 'remix',
      'astro': 'astro',
      'hugo': 'hugo',
      'jekyll': 'jekyll',
      'eleventy': 'eleventy',
      
      // Backend frameworks (no Vercel framework)
      'express': null,
      'express.js': null,
      'node.js': null,
      'node': null,
      'django': null,
      'flask': null,
      'spring boot': null,
      'laravel': null
    };

    const normalized = framework.toLowerCase().trim();
    return frameworkMap[normalized] !== undefined ? frameworkMap[normalized] : null;
  }
}
