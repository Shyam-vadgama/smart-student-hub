import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, Search } from "lucide-react";

interface ProjectUploadFormProps {
  open: boolean;
  onClose: () => void;
}

const LANGUAGES = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'PHP', 'Ruby', 'Swift', 'Kotlin'];
const FRAMEWORKS = ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Laravel'];
const PROJECT_TYPES = ['Web', 'App', 'AI', 'IOT', 'Research'];

const ProjectUploadForm: React.FC<ProjectUploadFormProps> = ({ open, onClose }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    languages: [] as string[],
    frameworks: [] as string[],
    tags: [] as string[],
    projectType: '',
    collaborators: [] as string[],
    demoVideoUrl: '',
    githubRepoUrl: '',
    deploymentType: 'Portfolio Only'
  });

  const [projectFiles, setProjectFiles] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch students for collaborator search
  const { data: students } = useQuery({
    queryKey: ['/api/users/students-all'],
    queryFn: () => apiRequest('GET', '/api/users/students-all').then(res => res.json()),
    enabled: open
  });

  // Check integration status
  const { data: integrationStatus } = useQuery({
    queryKey: ['/api/integrations/status'],
    queryFn: () => apiRequest('GET', '/api/integrations/status').then(res => res.json()),
    enabled: open
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest('POST', '/api/projects/create', data);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.autoDeploying) {
        toast({ 
          title: '🚀 Project uploaded and deploying!', 
          description: 'Your code is being pushed to GitHub. Refresh in a moment to see the status.' 
        });
      } else {
        toast({ title: '✅ Project uploaded successfully!' });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      queryClient.invalidateQueries({ queryKey: ['/api/projects/user'] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: 'Error uploading project', 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      languages: [],
      frameworks: [],
      tags: [],
      projectType: '',
      collaborators: [],
      demoVideoUrl: '',
      githubRepoUrl: '',
      deploymentType: 'Portfolio Only'
    });
    setProjectFiles(null);
    setScreenshots([]);
    setTagInput('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('languages', JSON.stringify(formData.languages));
    formDataToSend.append('frameworks', JSON.stringify(formData.frameworks));
    formDataToSend.append('tags', JSON.stringify(formData.tags));
    formDataToSend.append('projectType', formData.projectType);
    formDataToSend.append('collaborators', JSON.stringify(formData.collaborators));
    formDataToSend.append('demoVideoUrl', formData.demoVideoUrl);
    formDataToSend.append('githubRepoUrl', formData.githubRepoUrl);
    formDataToSend.append('deploymentType', formData.deploymentType);

    if (projectFiles) {
      formDataToSend.append('projectFiles', projectFiles);
    }

    screenshots.forEach(file => {
      formDataToSend.append('screenshots', file);
    });

    createProjectMutation.mutate(formDataToSend);
  };

  const toggleSelection = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const filteredStudents = students?.filter((student: any) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload New Project</DialogTitle>
          <DialogDescription>
            Add your project to your portfolio or deploy it live to GitHub + Vercel
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div>
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="My Awesome Project"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              placeholder="Describe your project..."
              rows={4}
            />
          </div>

          {/* Languages */}
          <div>
            <Label>Languages Used *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LANGUAGES.map(lang => (
                <Badge
                  key={lang}
                  variant={formData.languages.includes(lang) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ 
                    ...formData, 
                    languages: toggleSelection(formData.languages, lang) 
                  })}
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>

          {/* Frameworks */}
          <div>
            <Label>Frameworks Used *</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {FRAMEWORKS.map(framework => (
                <Badge
                  key={framework}
                  variant={formData.frameworks.includes(framework) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setFormData({ 
                    ...formData, 
                    frameworks: toggleSelection(formData.frameworks, framework) 
                  })}
                >
                  {framework}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags/Tech Stack</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                placeholder="Add a tag..."
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Project Type */}
          <div>
            <Label htmlFor="projectType">Project Type *</Label>
            <Select
              value={formData.projectType}
              onValueChange={(value) => setFormData({ ...formData, projectType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Collaborators */}
          <div>
            <Label>Collaborators</Label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {searchTerm && (
              <div className="mt-2 max-h-40 overflow-y-auto border rounded-md p-2">
                {filteredStudents?.map((student: any) => (
                  <div
                    key={student._id}
                    className="p-2 hover:bg-gray-100 cursor-pointer rounded"
                    onClick={() => {
                      if (!formData.collaborators.includes(student._id)) {
                        setFormData({ 
                          ...formData, 
                          collaborators: [...formData.collaborators, student._id] 
                        });
                      }
                      setSearchTerm('');
                    }}
                  >
                    {student.name} ({student.email})
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.collaborators.map(collabId => {
                const student = students?.find((s: any) => s._id === collabId);
                return student ? (
                  <Badge key={collabId} variant="secondary">
                    {student.name}
                    <X 
                      className="h-3 w-3 ml-1 cursor-pointer" 
                      onClick={() => setFormData({ 
                        ...formData, 
                        collaborators: formData.collaborators.filter(id => id !== collabId) 
                      })}
                    />
                  </Badge>
                ) : null;
              })}
            </div>
          </div>

          {/* Project Files (ZIP) */}
          <div>
            <Label htmlFor="projectFiles">
              Project Files (ZIP) {formData.deploymentType === 'Portfolio + Deploy' && '*'}
            </Label>
            <Input
              id="projectFiles"
              type="file"
              accept=".zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setProjectFiles(file);
                }
              }}
              className="mt-2"
            />
            {projectFiles && (
              <p className="text-sm text-gray-600 mt-1">
                Selected: {projectFiles.name} ({(projectFiles.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {formData.deploymentType === 'Portfolio + Deploy' 
                ? 'Required for deployment - Upload your project as a ZIP file'
                : 'Optional - Upload your project as a ZIP file for future deployment'}
            </p>
          </div>

          {/* Screenshots */}
          <div>
            <Label>Screenshots (Max 5)</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setScreenshots(files.slice(0, 5));
              }}
              className="mt-2"
            />
            {screenshots.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{screenshots.length} file(s) selected</p>
            )}
          </div>

          {/* Demo Video URL */}
          <div>
            <Label htmlFor="demoVideoUrl">Demo Video URL (Optional)</Label>
            <Input
              id="demoVideoUrl"
              type="url"
              value={formData.demoVideoUrl}
              onChange={(e) => setFormData({ ...formData, demoVideoUrl: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* GitHub Repo URL */}
          <div>
            <Label htmlFor="githubRepoUrl">GitHub Repository URL (Optional)</Label>
            <Input
              id="githubRepoUrl"
              type="url"
              value={formData.githubRepoUrl}
              onChange={(e) => setFormData({ ...formData, githubRepoUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
            />
          </div>

          {/* Deployment Type */}
          <div>
            <Label>Deployment Option *</Label>
            <div className="flex gap-4 mt-2">
              <Button
                type="button"
                variant={formData.deploymentType === 'Portfolio Only' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, deploymentType: 'Portfolio Only' })}
                className="flex-1"
              >
                🟢 Add to Portfolio Only
              </Button>
              <Button
                type="button"
                variant={formData.deploymentType === 'Portfolio + Deploy' ? 'default' : 'outline'}
                onClick={() => setFormData({ ...formData, deploymentType: 'Portfolio + Deploy' })}
                className="flex-1"
                disabled={!integrationStatus?.integrations?.github?.connected}
              >
                🔵 Add to Portfolio + Deploy
              </Button>
            </div>
            {formData.deploymentType === 'Portfolio + Deploy' && !integrationStatus?.integrations?.github?.connected && (
              <p className="text-sm text-orange-600 mt-2">
                ⚠️ Connect GitHub in Settings to enable deployment
              </p>
            )}
            {formData.deploymentType === 'Portfolio + Deploy' && 
             integrationStatus?.integrations?.github?.connected && 
             !integrationStatus?.integrations?.vercel?.connected && (
              <p className="text-sm text-blue-600 mt-2">
                ℹ️ GitHub connected! Optionally connect Vercel for automatic hosting.
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProjectMutation.isPending}>
              {createProjectMutation.isPending ? 'Uploading...' : 'Upload Project'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectUploadForm;
