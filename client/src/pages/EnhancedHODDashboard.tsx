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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Award,
  Plus,
  Eye,
  Mail,
  BarChart3,
  FolderGit2,
  ClipboardCheck,
  FileText,
  AlertCircle,
  Download,
  UserPlus,
  Calendar,
  Target,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import NAACReportList from "@/components/NAACReportList";
import WorkflowTracker from "@/components/WorkflowTracker";
import WorkflowManagement from "@/components/WorkflowManagement";

const EnhancedHODDashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNAACDialog, setShowNAACDialog] = useState(false);

  // Mock data
  const dashboardStats = {
    totalFaculty: 25,
    totalStudents: 480,
    totalSubjects: 32,
    avgAttendance: 88.5,
    avgPerformance: 85.2,
    pendingApprovals: 12,
    activeProjects: 45,
  };

  const facultyData = [
    { id: 1, name: "Dr. Amit Kumar", subjects: 3, students: 180, attendance: 92, performance: 88, status: "Active" },
    { id: 2, name: "Prof. Priya Sharma", subjects: 2, students: 120, attendance: 89, performance: 86, status: "Active" },
    { id: 3, name: "Dr. Rajesh Patel", subjects: 3, students: 150, attendance: 87, performance: 84, status: "Active" },
    { id: 4, name: "Prof. Sunita Desai", subjects: 2, students: 100, attendance: 90, performance: 87, status: "Active" },
  ];

  const studentPerformance = [
    { semester: "Sem 1", avg: 78 },
    { semester: "Sem 2", avg: 80 },
    { semester: "Sem 3", avg: 82 },
    { semester: "Sem 4", avg: 84 },
    { semester: "Sem 5", avg: 85 },
    { semester: "Sem 6", avg: 85.2 },
  ];

  const skillTrends = [
    { skill: "Python", students: 85 },
    { skill: "Java", students: 78 },
    { skill: "React", students: 72 },
    { skill: "Node.js", students: 68 },
    { skill: "Machine Learning", students: 65 },
    { skill: "Cloud Computing", students: 60 },
  ];

  const departmentSkills = [
    { subject: "Programming", A: 85, fullMark: 100 },
    { subject: "Web Dev", A: 78, fullMark: 100 },
    { subject: "Database", A: 82, fullMark: 100 },
    { subject: "Networks", A: 75, fullMark: 100 },
    { subject: "AI/ML", A: 70, fullMark: 100 },
  ];

  const topStudents = [
    { id: 1, name: "Rahul Sharma", cgpa: 9.2, projects: 8, achievements: 12, attendance: 95 },
    { id: 2, name: "Priya Patel", cgpa: 9.0, projects: 7, achievements: 10, attendance: 93 },
    { id: 3, name: "Amit Kumar", cgpa: 8.8, projects: 6, achievements: 9, attendance: 92 },
  ];

  const recentProjects = [
    { id: 1, title: "E-Commerce Platform", student: "Rahul Sharma", status: "Approved", date: "2024-01-10" },
    { id: 2, title: "AI Chatbot", student: "Priya Patel", status: "Pending", date: "2024-01-12" },
    { id: 3, title: "Mobile App", student: "Amit Kumar", status: "Under Review", date: "2024-01-13" },
  ];

  if (!user || user.role !== 'hod') {
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
          breadcrumbs={["HOD", "Dashboard"]}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">HOD Dashboard</h1>
                    <p className="text-gray-600 mt-1">Department of Computer Engineering</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setLocation('/create-subject')} variant="outline">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Add Subject
                  </Button>
                  <Button onClick={() => setLocation('/users')} className="bg-gradient-to-r from-blue-600 to-indigo-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Faculty
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Faculty</CardTitle>
                  <Users className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalFaculty}</div>
                  <p className="text-xs text-blue-200 mt-1">Active members</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Students</CardTitle>
                  <GraduationCap className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalStudents}</div>
                  <p className="text-xs text-green-200 mt-1">Across all years</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Active Projects</CardTitle>
                  <FolderGit2 className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.activeProjects}</div>
                  <p className="text-xs text-purple-200 mt-1">Student projects</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">Pending Approvals</CardTitle>
                  <ClipboardCheck className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.pendingApprovals}</div>
                  <p className="text-xs text-orange-200 mt-1">Requires action</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common department management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/create-timetable')}>
                    <Calendar className="h-6 w-6" />
                    <span className="text-sm">Create Timetable</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/forms')}>
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Create Form</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/analytics')}>
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                  <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => setLocation('/hod/download')}>
                    <Download className="h-6 w-6" />
                    <span className="text-sm">Download Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Student Performance Trends</CardTitle>
                  <CardDescription>Average performance across semesters</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={studentPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="semester" />
                      <YAxis domain={[70, 90]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} name="Average %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Skill Distribution</CardTitle>
                  <CardDescription>Popular skills among students</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={skillTrends} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="skill" type="category" width={100} />
                      <Tooltip />
                      <Bar dataKey="students" fill="#10b981" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Department Skills Radar */}
            <Card>
              <CardHeader>
                <CardTitle>Department Skill Assessment</CardTitle>
                <CardDescription>Overall competency across key areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={departmentSkills}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar name="Competency" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabs Section */}
            <Card>
              <Tabs defaultValue="faculty" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full lg:w-auto grid-cols-6 bg-gray-100">
                    <TabsTrigger value="faculty">Faculty</TabsTrigger>
                    <TabsTrigger value="students">Top Students</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
                    <TabsTrigger value="workflows">Workflows</TabsTrigger>
                    <TabsTrigger value="naac-reports">NAAC Reports</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="faculty" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Faculty Management</h3>
                      <Button size="sm" onClick={() => setLocation('/users')}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Faculty
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Subjects</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Avg Attendance</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {facultyData.map((faculty) => (
                          <TableRow key={faculty.id}>
                            <TableCell className="font-medium">{faculty.name}</TableCell>
                            <TableCell>{faculty.subjects}</TableCell>
                            <TableCell>{faculty.students}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={faculty.attendance} className="w-16 h-2" />
                                <span className="text-sm">{faculty.attendance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className={cn(
                                "font-semibold",
                                faculty.performance >= 85 ? "text-green-600" : "text-blue-600"
                              )}>
                                {faculty.performance}%
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{faculty.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="students" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Top Performing Students</h3>
                    <div className="grid gap-4">
                      {topStudents.map((student, index) => (
                        <Card key={student.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg",
                                  index === 0 ? "bg-yellow-500" :
                                  index === 1 ? "bg-gray-400" :
                                  "bg-orange-600"
                                )}>
                                  {index + 1}
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg">{student.name}</h4>
                                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                                    <span>CGPA: <strong>{student.cgpa}</strong></span>
                                    <span>Projects: <strong>{student.projects}</strong></span>
                                    <span>Achievements: <strong>{student.achievements}</strong></span>
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{student.attendance}%</div>
                                <div className="text-xs text-gray-500">Attendance</div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Recent Projects</h3>
                      <Button size="sm" onClick={() => setLocation('/review')}>
                        <ClipboardCheck className="h-4 w-4 mr-2" />
                        Review All
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Project Title</TableHead>
                          <TableHead>Student</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentProjects.map((project) => (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell>{project.student}</TableCell>
                            <TableCell>{project.date}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                project.status === 'Approved' ? "bg-green-100 text-green-800" :
                                project.status === 'Pending' ? "bg-yellow-100 text-yellow-800" :
                                "bg-blue-100 text-blue-800"
                              )}>
                                {project.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="leaderboard" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Department Leaderboard</h3>
                    <p className="text-sm text-gray-600">Based on projects, achievements, and academic performance</p>
                    <div className="space-y-3">
                      {topStudents.map((student, index) => (
                        <div key={student.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                              index === 0 ? "bg-gradient-to-br from-yellow-400 to-yellow-600" :
                              index === 1 ? "bg-gradient-to-br from-gray-300 to-gray-500" :
                              "bg-gradient-to-br from-orange-400 to-orange-600"
                            )}>
                              {index + 1}
                            </div>
                            <div>
                              <h4 className="font-semibold">{student.name}</h4>
                              <p className="text-sm text-gray-600">CGPA: {student.cgpa}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-bold text-blue-600">{student.projects}</div>
                              <div className="text-xs text-gray-500">Projects</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-green-600">{student.achievements}</div>
                              <div className="text-xs text-gray-500">Achievements</div>
                            </div>
                            <Award className="h-6 w-6 text-yellow-500" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="workflows" className="p-6">
                  <div className="space-y-6">
                    {/* Workflow Management - Workflows created by HOD */}
                    <WorkflowManagement />
                    
                    {/* Divider */}
                    <div className="border-t my-6" />
                    
                    {/* Workflow Tracker - Approval requests status */}
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Approval Request Status</h3>
                      <WorkflowTracker />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="naac-reports" className="p-6">
                  <NAACReportList />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedHODDashboard;
