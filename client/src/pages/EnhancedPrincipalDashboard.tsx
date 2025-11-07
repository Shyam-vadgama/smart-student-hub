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
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  UserCog,
  Award,
  Plus,
  Eye,
  Mail,
  BarChart3,
  BookOpen,
  AlertCircle,
  CheckCircle,
  Bell,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import ThirdPartyIntegrations from "@/components/ThirdPartyIntegrations";
import PrincipalNAACReportList from "@/components/PrincipalNAACReportList";

const EnhancedPrincipalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data
  const dashboardStats = {
    totalDepartments: 8,
    totalFaculty: 145,
    totalStudents: 2500,
    activeHODs: 8,
    avgAttendance: 87.5,
    avgPerformance: 84.2,
    naacReadiness: 78,
  };

  const departments = [
    { id: 1, name: "Computer Engineering", hod: "Dr. Amit Kumar", faculty: 25, students: 480, performance: 88, status: "Active" },
    { id: 2, name: "Electronics & Telecom", hod: "Dr. Priya Sharma", faculty: 20, students: 380, performance: 85, status: "Active" },
    { id: 3, name: "Mechanical Engineering", hod: "Dr. Rajesh Patel", faculty: 22, students: 420, performance: 82, status: "Active" },
    { id: 4, name: "Civil Engineering", hod: "Dr. Sunita Desai", faculty: 18, students: 350, performance: 80, status: "Active" },
    { id: 5, name: "Information Technology", hod: "Dr. Vikram Singh", faculty: 23, students: 450, performance: 90, status: "Active" },
  ];

  const attendanceTrends = [
    { month: "Jan", attendance: 82, target: 85 },
    { month: "Feb", attendance: 84, target: 85 },
    { month: "Mar", attendance: 86, target: 85 },
    { month: "Apr", attendance: 87, target: 85 },
    { month: "May", attendance: 88, target: 85 },
    { month: "Jun", attendance: 87.5, target: 85 },
  ];

  const performanceData = [
    { department: "IT", performance: 90 },
    { department: "CSE", performance: 88 },
    { department: "E&TC", performance: 85 },
    { department: "Mech", performance: 82 },
    { department: "Civil", performance: 80 },
  ];

  const recentAnnouncements = [
    { id: 1, title: "Mid-term exams scheduled", date: "2024-01-15", priority: "high" },
    { id: 2, title: "Faculty meeting on Friday", date: "2024-01-12", priority: "medium" },
    { id: 3, title: "New lab equipment installed", date: "2024-01-10", priority: "low" },
  ];

  const hodAssignments = [
    { id: 1, department: "Computer Engineering", hod: "Dr. Amit Kumar", assignedDate: "2023-06-01", status: "Active" },
    { id: 2, department: "Electronics & Telecom", hod: "Dr. Priya Sharma", assignedDate: "2023-06-01", status: "Active" },
    { id: 3, department: "Mechanical Engineering", hod: "Dr. Rajesh Patel", assignedDate: "2023-06-01", status: "Active" },
  ];

  if (!user || user.role !== 'principal') {
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
          breadcrumbs={["Principal", "Dashboard"]}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Principal Dashboard</h1>
                    <p className="text-gray-600 mt-1">College-wide management and oversight</p>
                  </div>
                </div>
                <Button onClick={() => setLocation('/create-department')} className="bg-gradient-to-r from-blue-600 to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Department
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Departments</CardTitle>
                  <Building2 className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalDepartments}</div>
                  <p className="text-xs text-blue-200 mt-1">All active departments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Active Faculty</CardTitle>
                  <Users className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalFaculty}</div>
                  <p className="text-xs text-green-200 mt-1">Including {dashboardStats.activeHODs} HODs</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Total Students</CardTitle>
                  <GraduationCap className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-purple-200 mt-1">Across all departments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">Avg Attendance</CardTitle>
                  <BarChart3 className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.avgAttendance}%</div>
                  <p className="text-xs text-orange-200 mt-1">College-wide average</p>
                </CardContent>
              </Card>
            </div>

            {/* NAAC/NBA Readiness */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>NAAC/NBA Accreditation Readiness</CardTitle>
                    <CardDescription>Current compliance and documentation status</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Overall Readiness</span>
                      <span className="text-sm font-bold text-blue-600">{dashboardStats.naacReadiness}%</span>
                    </div>
                    <Progress value={dashboardStats.naacReadiness} className="h-3" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Documentation</p>
                      <p className="text-sm font-bold text-green-600">Complete</p>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <AlertCircle className="h-6 w-6 text-yellow-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Faculty Data</p>
                      <p className="text-sm font-bold text-yellow-600">In Progress</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Award className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">Student Records</p>
                      <p className="text-sm font-bold text-blue-600">85% Done</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Monthly attendance vs target (85%)</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={attendanceTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="attendance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="target" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} strokeDasharray="5 5" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Academic performance by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="performance" fill="#10b981" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Card>
              <Tabs defaultValue="departments" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full lg:w-auto grid-cols-5 bg-gray-100">
                    <TabsTrigger value="departments">Departments</TabsTrigger>
                    <TabsTrigger value="hods">HOD Assignments</TabsTrigger>
                    <TabsTrigger value="announcements">Announcements</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                    <TabsTrigger value="naac-reports">NAAC Reports</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="departments" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Department Overview</h3>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>HOD</TableHead>
                          <TableHead>Faculty</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {departments.map((dept) => (
                          <TableRow key={dept.id}>
                            <TableCell className="font-medium">{dept.name}</TableCell>
                            <TableCell>{dept.hod}</TableCell>
                            <TableCell>{dept.faculty}</TableCell>
                            <TableCell>{dept.students}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Progress value={dept.performance} className="w-20 h-2" />
                                <span className="text-sm font-medium">{dept.performance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{dept.status}</Badge>
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

                <TabsContent value="hods" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">HOD Assignments</h3>
                      <Button size="sm">
                        <UserCog className="h-4 w-4 mr-2" />
                        Assign HOD
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Department</TableHead>
                          <TableHead>HOD Name</TableHead>
                          <TableHead>Assigned Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {hodAssignments.map((assignment) => (
                          <TableRow key={assignment.id}>
                            <TableCell className="font-medium">{assignment.department}</TableCell>
                            <TableCell>{assignment.hod}</TableCell>
                            <TableCell>{assignment.assignedDate}</TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{assignment.status}</Badge>
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

                <TabsContent value="announcements" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Recent Announcements</h3>
                      <Button size="sm">
                        <Bell className="h-4 w-4 mr-2" />
                        Create Announcement
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {recentAnnouncements.map((announcement) => (
                        <div key={announcement.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                                <Badge
                                  className={cn(
                                    "text-xs",
                                    announcement.priority === 'high' ? "bg-red-100 text-red-800" :
                                    announcement.priority === 'medium' ? "bg-yellow-100 text-yellow-800" :
                                    "bg-blue-100 text-blue-800"
                                  )}
                                >
                                  {announcement.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">{announcement.date}</p>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="integrations" className="p-6">
                  <ThirdPartyIntegrations />
                </TabsContent>

                <TabsContent value="naac-reports" className="p-6">
                  <PrincipalNAACReportList />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EnhancedPrincipalDashboard;
