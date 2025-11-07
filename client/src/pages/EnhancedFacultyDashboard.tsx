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
  BookOpen,
  ClipboardCheck,
  FileText,
  Trophy,
  AlertCircle,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Eye,
  Code,
} from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const EnhancedFacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data
  const dashboardStats = {
    mySubjects: 3,
    totalStudents: 180,
    classesToday: 4,
    pendingMarks: 8,
    avgAttendance: 89.5,
    pendingApprovals: 5,
  };

  const mySubjects = [
    { id: 1, name: "Data Structures", code: "CS301", students: 60, classes: 45, attendance: 92 },
    { id: 2, name: "Web Development", code: "CS302", students: 60, classes: 40, attendance: 88 },
    { id: 3, name: "Database Management", code: "CS303", students: 60, classes: 42, attendance: 89 },
  ];

  const todayClasses = [
    { id: 1, subject: "Data Structures", time: "09:00 - 10:00", classroom: "Lab 1", semester: 3 },
    { id: 2, subject: "Web Development", time: "10:15 - 11:15", classroom: "Room 201", semester: 3 },
    { id: 3, subject: "Database Management", time: "13:00 - 14:00", classroom: "Lab 2", semester: 4 },
    { id: 4, subject: "Data Structures", time: "14:15 - 15:15", classroom: "Room 202", semester: 3 },
  ];

  const attendanceData = [
    { week: "Week 1", attendance: 85 },
    { week: "Week 2", attendance: 87 },
    { week: "Week 3", attendance: 89 },
    { week: "Week 4", attendance: 88 },
    { week: "Week 5", attendance: 90 },
    { week: "Week 6", attendance: 89.5 },
  ];

  const lowAttendanceStudents = [
    { id: 1, name: "Rahul Sharma", rollNo: "CS2101", attendance: 68, subject: "Data Structures" },
    { id: 2, name: "Priya Patel", rollNo: "CS2102", attendance: 72, subject: "Web Development" },
    { id: 3, name: "Amit Kumar", rollNo: "CS2103", attendance: 70, subject: "Database Management" },
  ];

  const pendingAchievements = [
    { id: 1, student: "Rahul Sharma", title: "Hackathon Winner", date: "2024-01-10", status: "Pending" },
    { id: 2, student: "Priya Patel", title: "Research Paper Published", date: "2024-01-12", status: "Pending" },
    { id: 3, student: "Amit Kumar", title: "Internship Completed", date: "2024-01-13", status: "Pending" },
  ];

  const marksDistribution = [
    { range: "90-100", count: 15, color: "#10b981" },
    { range: "80-89", count: 25, color: "#3b82f6" },
    { range: "70-79", count: 18, color: "#f59e0b" },
    { range: "60-69", count: 8, color: "#ef4444" },
    { range: "<60", count: 4, color: "#dc2626" },
  ];

  const recentSubmissions = [
    { id: 1, student: "Rahul Sharma", assignment: "Project Report", subject: "Web Development", date: "2024-01-14", status: "Pending Review" },
    { id: 2, student: "Priya Patel", assignment: "Lab Assignment 5", subject: "Data Structures", date: "2024-01-14", status: "Reviewed" },
    { id: 3, student: "Amit Kumar", assignment: "Quiz 3", subject: "Database Management", date: "2024-01-13", status: "Pending Review" },
  ];

  if (!user || user.role !== 'faculty') {
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
          breadcrumbs={["Faculty", "Dashboard"]}
        />

        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpen className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome back, {user.name}!</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => setLocation('/attendance')} className="bg-gradient-to-r from-blue-600 to-indigo-700">
                    <ClipboardCheck className="h-4 w-4 mr-2" />
                    Mark Attendance
                  </Button>
                  <Button onClick={() => setLocation('/faculty/marks')} variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Enter Marks
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">My Subjects</CardTitle>
                  <BookOpen className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.mySubjects}</div>
                  <p className="text-xs text-blue-200 mt-1">Active courses</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Students</CardTitle>
                  <Users className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalStudents}</div>
                  <p className="text-xs text-green-200 mt-1">Across all subjects</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Classes Today</CardTitle>
                  <Calendar className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.classesToday}</div>
                  <p className="text-xs text-purple-200 mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">Pending Tasks</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.pendingMarks + dashboardStats.pendingApprovals}</div>
                  <p className="text-xs text-orange-200 mt-1">{dashboardStats.pendingMarks} marks, {dashboardStats.pendingApprovals} approvals</p>
                </CardContent>
              </Card>
            </div>

            {/* Today's Schedule */}
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Today's Schedule</CardTitle>
                    <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setLocation('/faculty/timetable')}>
                    <Calendar className="h-4 w-4 mr-2" />
                    View Full Timetable
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {todayClasses.map((classItem) => (
                    <div key={classItem.id} className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <Badge className="bg-blue-100 text-blue-800 text-xs">Sem {classItem.semester}</Badge>
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{classItem.subject}</h4>
                      <p className="text-sm text-gray-600">{classItem.time}</p>
                      <p className="text-xs text-gray-500 mt-1">{classItem.classroom}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Low Attendance Alert */}
            {lowAttendanceStudents.length > 0 && (
              <Card className="border-l-4 border-l-orange-500 bg-orange-50">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    <CardTitle className="text-orange-900">Students Below 75% Attendance</CardTitle>
                  </div>
                  <CardDescription className="text-orange-700">These students need immediate attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {lowAttendanceStudents.map((student) => (
                      <div key={student.id} className="p-3 bg-white rounded-lg border border-orange-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900">{student.name}</h4>
                          <span className="text-lg font-bold text-orange-600">{student.attendance}%</span>
                        </div>
                        <p className="text-xs text-gray-600">{student.rollNo}</p>
                        <p className="text-xs text-gray-500 mt-1">{student.subject}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Trends</CardTitle>
                  <CardDescription>Weekly attendance percentage</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={attendanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis domain={[80, 95]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} name="Attendance %" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Marks Distribution</CardTitle>
                  <CardDescription>Student performance across all subjects</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={marksDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count }) => `${range}: ${count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {marksDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Tabs Section */}
            <Card>
              <Tabs defaultValue="subjects" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full lg:w-auto grid-cols-4 bg-gray-100">
                    <TabsTrigger value="subjects">My Subjects</TabsTrigger>
                    <TabsTrigger value="achievements">
                      Achievements
                      {dashboardStats.pendingApprovals > 0 && (
                        <Badge className="ml-2 bg-orange-500 text-white">{dashboardStats.pendingApprovals}</Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    <TabsTrigger value="tools">Tools</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="subjects" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">My Subjects</h3>
                    <div className="grid gap-4">
                      {mySubjects.map((subject) => (
                        <Card key={subject.id} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <BookOpen className="h-5 w-5 text-blue-600" />
                                  <div>
                                    <h4 className="font-semibold text-lg">{subject.name}</h4>
                                    <p className="text-sm text-gray-600">{subject.code}</p>
                                  </div>
                                </div>
                                <div className="flex gap-6 mt-3 text-sm">
                                  <div>
                                    <span className="text-gray-600">Students: </span>
                                    <strong>{subject.students}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Classes: </span>
                                    <strong>{subject.classes}</strong>
                                  </div>
                                  <div>
                                    <span className="text-gray-600">Attendance: </span>
                                    <strong className={cn(
                                      subject.attendance >= 85 ? "text-green-600" : "text-orange-600"
                                    )}>{subject.attendance}%</strong>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={() => setLocation('/attendance')}>
                                  <ClipboardCheck className="h-4 w-4 mr-1" />
                                  Attendance
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setLocation('/faculty/marks')}>
                                  <FileText className="h-4 w-4 mr-1" />
                                  Marks
                                </Button>
                              </div>
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
                      <h3 className="text-lg font-semibold">Pending Achievement Approvals</h3>
                      <Button size="sm" onClick={() => setLocation('/review')}>
                        <Trophy className="h-4 w-4 mr-2" />
                        Review All
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Achievement</TableHead>
                          <TableHead>Submitted Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingAchievements.map((achievement) => (
                          <TableRow key={achievement.id}>
                            <TableCell className="font-medium">{achievement.student}</TableCell>
                            <TableCell>{achievement.title}</TableCell>
                            <TableCell>{achievement.date}</TableCell>
                            <TableCell>
                              <Badge className="bg-yellow-100 text-yellow-800">{achievement.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setLocation('/review')}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700">
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="submissions" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent Submissions</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Student</TableHead>
                          <TableHead>Assignment</TableHead>
                          <TableHead>Subject</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-medium">{submission.student}</TableCell>
                            <TableCell>{submission.assignment}</TableCell>
                            <TableCell>{submission.subject}</TableCell>
                            <TableCell>{submission.date}</TableCell>
                            <TableCell>
                              <Badge className={cn(
                                submission.status === 'Reviewed' ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                              )}>
                                {submission.status}
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

                <TabsContent value="tools" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Faculty Tools</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/leetcode/create')}>
                        <CardHeader>
                          <Code className="h-8 w-8 text-blue-600 mb-2" />
                          <CardTitle className="text-base">Create Coding Problem</CardTitle>
                          <CardDescription>Design practice problems for students</CardDescription>
                        </CardHeader>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/forms')}>
                        <CardHeader>
                          <FileText className="h-8 w-8 text-green-600 mb-2" />
                          <CardTitle className="text-base">Create Form</CardTitle>
                          <CardDescription>Dynamic forms for data collection</CardDescription>
                        </CardHeader>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setLocation('/faculty/reports')}>
                        <CardHeader>
                          <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                          <CardTitle className="text-base">Generate Reports</CardTitle>
                          <CardDescription>Student performance reports</CardDescription>
                        </CardHeader>
                      </Card>
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

export default EnhancedFacultyDashboard;
