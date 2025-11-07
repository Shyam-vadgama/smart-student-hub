import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, Mail, GraduationCap, Calendar, Award, FileCode, 
  Github, Linkedin, Twitter, Globe, ExternalLink, Search,
  Building, BookOpen, TrendingUp
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PublicPortfolio {
  _id: string;
  student: string;
  studentName: string;
  studentEmail: string;
  department: { name: string };
  college: { name: string };
  semester?: number;
  course?: string;
  batch?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  socialLinks?: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  projects: any[];
  achievements: any[];
  resume?: any;
  marks: any[];
  totalProjects: number;
  totalAchievements: number;
  averageMarks?: number;
  lastUpdated: string;
}

export default function PublicPortfolioPage() {
  const [, params] = useRoute('/public-portfolio/:studentId');
  const [portfolio, setPortfolio] = useState<PublicPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');

  useEffect(() => {
    if (params?.studentId) {
      fetchPortfolio(params.studentId);
    }
  }, [params?.studentId]);

  const fetchPortfolio = async (studentId: string) => {
    try {
      const response = await fetch(`/api/public-portfolios/student/${studentId}`);

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      } else {
        setPortfolio(null);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByEmail = async () => {
    if (!searchEmail) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/public-portfolios/email/${encodeURIComponent(searchEmail)}`);

      if (response.ok) {
        const data = await response.json();
        setPortfolio(data);
      } else {
        setPortfolio(null);
      }
    } catch (error) {
      console.error('Error searching portfolio:', error);
      setPortfolio(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio && !params?.studentId) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Search Student Portfolio</CardTitle>
            <CardDescription>Enter a student's email to view their public portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="student@example.com"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchByEmail()}
              />
              <Button onClick={handleSearchByEmail}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <User className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Portfolio Not Found</h2>
            <p className="text-muted-foreground text-center">
              This student hasn't created a public portfolio yet or it's not publicly visible.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header Section */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24">
                <AvatarFallback className="text-2xl">
                  {getInitials(portfolio.studentName)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">{portfolio.studentName}</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {portfolio.studentEmail}
                  </div>
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    {portfolio.college.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    {portfolio.department.name}
                  </div>
                  {portfolio.semester && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Semester {portfolio.semester}
                    </div>
                  )}
                  {portfolio.course && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {portfolio.course}
                    </div>
                  )}
                  {portfolio.batch && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Batch {portfolio.batch}
                    </div>
                  )}
                </div>

                {portfolio.bio && (
                  <p className="text-muted-foreground mb-4">{portfolio.bio}</p>
                )}

                {portfolio.socialLinks && (
                  <div className="flex gap-2">
                    {portfolio.socialLinks.github && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolio.socialLinks.github} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          GitHub
                        </a>
                      </Button>
                    )}
                    {portfolio.socialLinks.linkedin && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolio.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </a>
                      </Button>
                    )}
                    {portfolio.socialLinks.twitter && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolio.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </a>
                      </Button>
                    )}
                    {portfolio.socialLinks.portfolio && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={portfolio.socialLinks.portfolio} target="_blank" rel="noopener noreferrer">
                          <Globe className="h-4 w-4 mr-2" />
                          Website
                        </a>
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex md:flex-col gap-4">
                <Card className="flex-1">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-primary">{portfolio.totalProjects}</div>
                    <div className="text-xs text-muted-foreground">Projects</div>
                  </CardContent>
                </Card>
                <Card className="flex-1">
                  <CardContent className="pt-4 text-center">
                    <div className="text-3xl font-bold text-primary">{portfolio.totalAchievements}</div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                  </CardContent>
                </Card>
                {portfolio.averageMarks && (
                  <Card className="flex-1">
                    <CardContent className="pt-4 text-center">
                      <div className="text-3xl font-bold text-primary">{portfolio.averageMarks.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">Avg. Marks</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills & Interests */}
        {(portfolio.skills?.length > 0 || portfolio.interests?.length > 0) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Skills & Interests</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {portfolio.skills && portfolio.skills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {portfolio.interests && portfolio.interests.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {portfolio.interests.map((interest, index) => (
                      <Badge key={index} variant="outline">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Content Tabs */}
        <Tabs defaultValue="projects" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="projects">
              <FileCode className="h-4 w-4 mr-2" />
              Projects ({portfolio.totalProjects})
            </TabsTrigger>
            <TabsTrigger value="achievements">
              <Award className="h-4 w-4 mr-2" />
              Achievements ({portfolio.totalAchievements})
            </TabsTrigger>
            <TabsTrigger value="performance">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="space-y-4">
            {portfolio.projects.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileCode className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No projects yet</p>
                </CardContent>
              </Card>
            ) : (
              portfolio.projects.map((project, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{project.name}</CardTitle>
                        <CardDescription>{project.description}</CardDescription>
                      </div>
                      <Badge>{project.projectType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {project.languages.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Languages</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.languages.map((lang: string, i: number) => (
                            <Badge key={i} variant="secondary">{lang}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.frameworks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold mb-2">Frameworks</h4>
                        <div className="flex flex-wrap gap-2">
                          {project.frameworks.map((framework: string, i: number) => (
                            <Badge key={i} variant="outline">{framework}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {project.screenshots && project.screenshots.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {project.screenshots.slice(0, 3).map((screenshot: string, i: number) => (
                          <img
                            key={i}
                            src={screenshot}
                            alt={`Screenshot ${i + 1}`}
                            className="rounded-lg object-cover aspect-video"
                          />
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {project.githubRepoUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.githubRepoUrl} target="_blank" rel="noopener noreferrer">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}
                      {project.vercelUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Live Demo
                          </a>
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Approved on {new Date(project.approvedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="achievements" className="space-y-4">
            {portfolio.achievements.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Award className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No achievements yet</p>
                </CardContent>
              </Card>
            ) : (
              portfolio.achievements.map((achievement, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle>{achievement.title}</CardTitle>
                        <CardDescription>{achievement.description}</CardDescription>
                      </div>
                      {achievement.category && <Badge>{achievement.category}</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {achievement.type && (
                      <Badge variant="outline">{achievement.type}</Badge>
                    )}

                    {achievement.media && achievement.media.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {achievement.media.map((item: any, i: number) => (
                          item.type === 'image' ? (
                            <img
                              key={i}
                              src={item.url}
                              alt={item.caption || `Media ${i + 1}`}
                              className="rounded-lg object-cover aspect-video"
                            />
                          ) : (
                            <video
                              key={i}
                              src={item.url}
                              controls
                              className="rounded-lg object-cover aspect-video"
                            />
                          )
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      Approved on {new Date(achievement.approvedAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            {portfolio.marks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No performance data available</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Academic Performance</CardTitle>
                  {portfolio.averageMarks && (
                    <CardDescription>
                      Average Score: {portfolio.averageMarks.toFixed(2)}%
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {portfolio.marks.map((mark, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium">{mark.subject}</p>
                          <p className="text-sm text-muted-foreground">
                            {mark.examType} - Semester {mark.semester}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">{mark.marks}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-muted-foreground mt-8">
          Last updated: {new Date(portfolio.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
