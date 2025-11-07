import axios from 'axios';
import simpleGit, { SimpleGit } from 'simple-git';
import fs from 'fs';
import path from 'path';
import archiver from 'archiver';

// Helper function to validate and sanitize file paths for GitHub
function sanitizeGitPath(filePath: string, baseDir: string = ''): { isValid: boolean; sanitizedPath?: string; error?: string } {
  try {
    // Normalize path separators and resolve relative paths
    let normalizedPath = path.normalize(filePath).replace(/\\/g, '/');
    
    // Remove any leading slashes or ./ to prevent path traversal
    normalizedPath = normalizedPath.replace(/^(\/|\.\/|\\)+/, '');
    
    // Check for path traversal attempts
    if (normalizedPath.includes('../') || normalizedPath.includes('..\\')) {
      return { isValid: false, error: 'Path traversal detected' };
    }
    
    // Check for invalid characters in path components
    const invalidChars = ['~', '^', ':', '?', '*', '[', ']', '\\', '//'];
    const pathSegments = normalizedPath.split('/');
    
    for (const segment of pathSegments) {
      if (segment === '') continue; // Skip empty segments from double slashes
      
      // Check for invalid characters in the segment
      if (invalidChars.some(char => segment.includes(char))) {
        return { 
          isValid: false, 
          error: `Invalid character in path segment: ${segment}` 
        };
      }
      
      // Check for reserved filenames (Windows and Unix)
      const reservedNames = [
        'CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 'COM5',
        'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5',
        'LPT6', 'LPT7', 'LPT8', 'LPT9', '..', '.', ''
      ];
      
      const upperSegment = segment.toUpperCase();
      if (reservedNames.some(name => upperSegment === name || upperSegment.startsWith(name + '.'))) {
        return { 
          isValid: false, 
          error: `Reserved filename: ${segment}` 
        };
      }
    }
    
    // Check maximum path length (GitHub has a limit of 255 bytes per path component)
    const maxPathLength = 255;
    for (const segment of pathSegments) {
      if (Buffer.from(segment).length > maxPathLength) {
        return { 
          isValid: false, 
          error: `Path component too long (max ${maxPathLength} bytes): ${segment}` 
        };
      }
    }
    
    // Reconstruct the sanitized path
    const sanitizedPath = pathSegments.join('/');
    
    return { 
      isValid: true, 
      sanitizedPath: path.join(baseDir, sanitizedPath).replace(/\\/g, '/')
    };
  } catch (error) {
    return { 
      isValid: false, 
      error: `Error validating path: ${error.message}` 
    };
  }
}

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

  // Push files to repository using GitHub API
  async pushFilesToRepo(owner: string, repo: string, files: { path: string; content: string }[], commitMessage: string = 'Initial commit') {
    try {
      // Validate all file paths first
      const validatedFiles = [];
      const invalidFiles = [];
      
      for (const file of files) {
        const validation = sanitizeGitPath(file.path);
        if (validation.isValid && validation.sanitizedPath) {
          validatedFiles.push({
            ...file,
            path: validation.sanitizedPath
          });
        } else {
          console.warn(`Skipping invalid file path: ${file.path} - ${validation.error || 'Invalid path'}`);
          invalidFiles.push({
            path: file.path,
            error: validation.error || 'Invalid path'
          });
        }
      }
      
      if (validatedFiles.length === 0) {
        throw new Error('No valid files to commit. All file paths were invalid.');
      }
      
      // Log skipped files
      if (invalidFiles.length > 0) {
        console.warn(`Skipped ${invalidFiles.length} invalid files during GitHub push`);
      }

      // Get the latest commit SHA
      const { data: refData } = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/main`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      const latestCommitSha = refData.object.sha;

      // Get the tree SHA from the latest commit
      const { data: commitData } = await axios.get(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      const baseTreeSha = commitData.tree.sha;

      // Create blobs for each valid file
      const tree = await Promise.all(
        validatedFiles.map(async (file) => {
          try {
            const { data: blobData } = await axios.post(
              `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`,
              {
                content: Buffer.from(file.content).toString('base64'),
                encoding: 'base64'
              },
              {
                headers: {
                  Authorization: `Bearer ${this.token}`,
                  Accept: 'application/vnd.github.v3+json',
                  'Content-Type': 'application/json'
                }
              }
            );

            return {
              path: file.path,
              mode: '100644',
              type: 'blob',
              sha: blobData.sha
            };
          } catch (error) {
            console.error(`Error creating blob for ${file.path}:`, error.message);
            throw new Error(`Failed to create blob for ${file.path}: ${error.message}`);
          }
        })
      ).catch(error => {
        console.error('Error creating blobs:', error);
        throw new Error(`Failed to create file blobs: ${error.message}`);
      });

      // Create a new tree
      const { data: newTree } = await axios.post(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`,
        {
          base_tree: baseTreeSha,
          tree
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Create a new commit
      const { data: newCommit } = await axios.post(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`,
        {
          message: commitMessage,
          tree: newTree.sha,
          parents: [latestCommitSha]
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      // Update the reference
      await axios.patch(
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/main`,
        {
          sha: newCommit.sha,
          force: true
        },
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        }
      );

      return { success: true, message: 'Files pushed successfully', commitSha: newCommit.sha };
    } catch (error: any) {
      throw new Error(`Failed to push files: ${error.response?.data?.message || error.message}`);
    }
  }

  // Get repository by name
  async getRepository(owner: string, repo: string) {
    try {
      const response = await axios.get(`${GITHUB_API_BASE}/repos/${owner}/${repo}`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch repository: ${error.message}`);
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
