import axios from 'axios';
import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

const GITHUB_API_BASE = 'https://api.github.com';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  // Get user's repositories
  async getRepositories() {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/user/repos`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          sort: 'updated',
          per_page: 100
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch repositories: ${error.message}`);
    }
  }

  // Create a new repository
  async createRepository(name: string, description: string, isPrivate: boolean = false) {
    try {
      const response = await axios.post(
        `${GITHUB_API_BASE}/user/repos`,
        {
          name,
          description,
          private: isPrivate,
          auto_init: true
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create repository: ${error.message}`);
    }
  }

  // Push files to repository
  async pushFilesToRepo(repoUrl: string, localPath: string, commitMessage: string = 'Initial commit') {
    try {
      const git: SimpleGit = simpleGit(localPath);
      
      // Initialize git if not already initialized
      await git.init();
      
      // Add remote with token authentication
      const authenticatedUrl = repoUrl.replace('https://', `https://${this.token}@`);
      await git.addRemote('origin', authenticatedUrl);
      
      // Add all files
      await git.add('.');
      
      // Commit
      await git.commit(commitMessage);
      
      // Push to main branch
      await git.push('origin', 'main', ['--force']);
      
      return { success: true, message: 'Files pushed successfully' };
    } catch (error: any) {
      throw new Error(`Failed to push files: ${error.message}`);
    }
  }

  // Get authenticated user info
  async getUserInfo() {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/user`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch user info: ${error.message}`);
    }
  }
}

// Helper function to extract project files to a temporary directory
export async function extractProjectFiles(zipPath: string, extractPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const extract = require('extract-zip');
    extract(zipPath, { dir: extractPath })
      .then(() => resolve())
      .catch((err: Error) => reject(err));
  });
}
