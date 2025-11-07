import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  Trophy,
  FolderGit2,
  Code,
  MessageSquare,
  Target,
  TrendingUp,
  Calendar,
  BookOpen,
  ClipboardCheck,
  FileText,
  Award,
  Zap,
  GitBranch,
  Github,
  Globe,
  Plus,
  Eye,
  AlertCircle,
  CheckCircle,
  Flame,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

const EnhancedStudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data
  const dashboardStats = {
    attendance: 87.5,
    totalProjects: 8,
    achievements: 12,
    codingStreak: 15,
    cgpa: 8.5,
    leaderboardRank: 12,
    resumeScore: 85,
  };

  const myProjects = [
    { id: 1, title: "E-Commerce Platform", tech: ["React", "Node.js", "MongoDB"], status: "Deployed", github: true, vercel: true, likes: 24 },
    { id: 2, title: "AI Chatbot", tech: ["Python", "TensorFlow", "Flask"], status: "In Progress", github: true, vercel: false, likes: 18 },
    { id: 3, title: "Mobile Fitness App", tech: ["React Native", "Firebase"], status: "Approved", github: true, vercel: false, likes: 32 },
  ];

  const achievements = [
    { id: 1, title: "Hackathon Winner - Smart India Hackathon", date: "2024-01-10", status: "Approved", points: 100 },
    { id: 2, title: "Research Paper Published - IEEE", date: "2024-01-05", status: "Approved", points: 150 },
    { id: 3, title: "Internship Completed - TCS", date: "2023-12-20", status: "Pending", points: 80 },
  ];

  const skillProgress = [
    { skill: "Python", level: 85 },
    { skill: "React", level: 78 },
    { skill: "Node.js", level: 72 },
    { skill: "Machine Learning", level: 65 },
    { skill: "Cloud Computing", level: 60 },
  ];

  const attendanceData = [
    { month: "Aug", attendance: 82 },
    { month: "Sep", attendance: 85 },
    { month: "Oct", attendance: 87 },
    { month: "Nov", attendance: 88 },
    { month: "Dec", attendance: 86 },
    { month: "Jan", attendance: 87.5 },
  ];

  const performanceData = [
    { subject: "DSA", A: 88, fullMark: 100 },
    { subject: "Web Dev", A: 92, fullMark: 100 },
    { subject: "Database", A: 85, fullMark: 100 },
    { subject: "Networks", A: 80, fullMark: 100 },
    { subject: "AI/ML", A: 78, fullMark: 100 },
  ];

  const recentActivity = [
    { id: 1, type: "project", title: "Deployed E-Commerce Platform", time: "2 hours ago", icon: Globe },
    { id: 2, type: "achievement", title: "Achievement approved by HOD", time: "5 hours ago", icon: Trophy },
    { id: 3, type: "code", title: "Solved 5 coding problems", time: "1 day ago", icon: Code },
    { id: 4, type: "post", title: "Posted on discussion feed", time: "2 days ago", icon: MessageSquare },
  ];

  const upcomingClasses = [
    { id: 1, subject: "Data Structures", time: "09:00 - 10:00", room: "Lab 1" },
    { id: 2, subject: "Web Development", time: "10:15 - 11:15", room: "Room 201" },
    { id: 3, subject: "Database Management", time: "13:00 - 14:00", room: "Lab 2" },
  ];

  const leaderboard = [
    { rank: 1, name: "Priya Sharma", points: 850, projects: 12, achievements: 18 },
    { rank: 2, name: "Amit Kumar", points: 820, projects: 11, achievements: 16 },
    { rank: 12, name: user?.name || "You", points: 650, projects: 8, achievements: 12, isCurrentUser: true },
  ];

  if (!user || user.role !== 'student') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <EnhancedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={cn("transition-all duration-300 ease-in-out lg:ml-64 flex flex-col min-h-screen")}>
        <EnhancedNavbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={["Student", "Dashboard"]}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center shadow-lg">
                    <GraduationCap className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold">Welcome back, {user.name}!</h1>
                    <p className="text-blue-100 mt-1">Keep up the great work! 🚀</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dashboardStats.cgpa}</div>
                    <div className="text-xs text-blue-100">CGPA</div>
                  </div>
                  <div className="h-12 w-px bg-white/30"></div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">#{dashboardStats.leaderboardRank}</div>
                    <div className="text-xs text-blue-100">Rank</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Attendance</CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.attendance}%</div>
                  <Progress value={dashboardStats.attendance} className="h-2 mt-2 bg-green-300" />
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">My Projects</CardTitle>
                  <FolderGit2 className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalProjects}</div>
                  <p className="text-xs text-purple-200 mt-1">3 deployed live</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">Achievements</CardTitle>
                  <Trophy className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.achievements}</div>
                  <p className="text-xs text-orange-200 mt-1">1 pending approval</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-100">Coding Streak</CardTitle>
                  <Flame className="h-5 w-5 text-red-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.codingStreak} days</div>
                  <p className="text-xs text-red-200 mt-1">Keep it going! 🔥</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Jump to your most used features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/achievements')}>
                    <Plus className="h-6 w-6" />
                    <span className="text-sm">Add Project</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/leetcode')}>
                    <Code className="h-6 w-6" />
                    <span className="text-sm">Practice Code</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/resume-builder')}>
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Build Resume</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/feed')}>
                    <MessageSquare className="h-6 w-6" />
                    <span className="text-sm">Discussion</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/student/forms')}>
                    <ClipboardCheck className="h-6 w-6" />
                    <span className="text-sm">Fill Forms</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Your attendance over the past 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[75, 95]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={3} name="Attendance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Performance</CardTitle>
                  <CardDescription>Your performance across subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={performanceData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                      <Tooltip />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Skills Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Skill Progress</CardTitle>
                <CardDescription>Track your technical skills development</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillProgress.map((skill) => (
                    <div key={skill.skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{skill.skill}</span>
                        <span className="text-sm font-bold text-blue-600">{skill.level}%</span>
                      </div>
                      <Progress value={skill.level} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Main Tabs */}
            <Card>
              <Tabs defaultValue="projects" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full lg:w-auto grid-cols-5 bg-gray-100">
                    <TabsTrigger value="projects">
                      <FolderGit2 className="h-4 w-4 mr-1" />
                      Projects
                    </TabsTrigger>
                    <TabsTrigger value="achievements">
                      <Trophy className="h-4 w-4 mr-1" />
                      Achievements
                    </TabsTrigger>
                    <TabsTrigger value="schedule">
                      <Calendar className="h-4 w-4 mr-1" />
                      Schedule
                    </TabsTrigger>
                    <TabsTrigger value="leaderboard">
                      <Target className="h-4 w-4 mr-1" />
                      Leaderboard
                    </TabsTrigger>
                    <TabsTrigger value="activity">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Activity
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="projects" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">My Projects</h3>
                      <Button onClick={() => setLocation('/achievements')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Project
                      </Button>
                    </div>
                    <div className="grid gap-4">
                      {myProjects.map((project) => (
                        <Card key={project.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <FolderGit2 className="h-5 w-5 text-blue-600" />
                                  <h4 className="font-semibold text-lg">{project.title}</h4>
                                  <Badge className={cn(
                                    project.status === 'Deployed' ? "bg-green-100 text-green-800" :
                                    project.status === 'Approved' ? "bg-blue-100 text-blue-800" :
                                    "bg-yellow-100 text-yellow-800"
                                  )}>
                                    {project.status}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {project.tech.map((tech) => (
                                    <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                                  ))}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                  {project.github && (
                                    <div className="flex items-center gap-1">
                                      <Github className="h-4 w-4" />
                                      <span>GitHub</span>
                                    </div>
                                  )}
                                  {project.vercel && (
                                    <div className="flex items-center gap-1">
                                      <Globe className="h-4 w-4" />
                                      <span>Live</span>
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Award className="h-4 w-4" />
                                    <span>{project.likes} likes</span>
                                  </div>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">My Achievements</h3>
                      <Button onClick={() => setLocation('/achievements')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Achievement
                      </Button>
                    </div>
                    <div className="grid gap-3">
                      {achievements.map((achievement) => (
                        <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                                  <Trophy className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{achievement.title}</h4>
                                  <p className="text-sm text-gray-600">{achievement.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-blue-600">+{achievement.points}</div>
                                  <div className="text-xs text-gray-500">points</div>
                                </div>
                                <Badge className={cn(
                                  achievement.status === 'Approved' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                )}>
                                  {achievement.status}
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="schedule" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Today's Classes</h3>
                    <div className="grid gap-3">
                      {upcomingClasses.map((classItem) => (
                        <Card key={classItem.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <BookOpen className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                  <h4 className="font-semibold">{classItem.subject}</h4>
                                  <p className="text-sm text-gray-600">{classItem.time}</p>
                                </div>
                              </div>
                              <Badge variant="outline">{classItem.room}</Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="leaderboard" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Department Leaderboard</h3>
                    <div className="space-y-3">
                      {leaderboard.map((student) => (
                        <Card key={student.rank} className={cn(
                          "hover:shadow-md transition-shadow",
                          student.isCurrentUser && "border-2 border-blue-500 bg-blue-50"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                                  student.rank === 1 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                                  student.rank === 2 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                                  student.isCurrentUser ? "bg-gradient-to-br from-blue-500 to-blue-700" :
                                  "bg-gradient-to-br from-gray-400 to-gray-600"
                                )}>
                                  {student.rank}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">{student.name}</h4>
                                  <div className="flex gap-4 text-sm text-gray-600">
                                    <span>Projects: <strong>{student.projects}</strong></span>
                                    <span>Achievements: <strong>{student.achievements}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">{student.points}</div>
                                <div className="text-xs text-gray-500">points</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Activity</h3>
                    <div className="space-y-3">
                      {recentActivity.map((activity) => {
                        const Icon = activity.icon;
                        return (
                          <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Icon className="h-5 w-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.title}</p>
                              <p className="text-sm text-gray-500">{activity.time}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedStudentDashboard;
