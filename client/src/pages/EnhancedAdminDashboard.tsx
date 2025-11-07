import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import EnhancedSidebar from "@/components/EnhancedSidebar";
import EnhancedNavbar from "@/components/EnhancedNavbar";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  Activity,
  Award,
  Plus,
  Eye,
  Mail,
  BarChart3,
  Calendar,
  Shield,
  AlertCircle,
} from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const EnhancedAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock data - replace with real API calls
  const dashboardStats = {
    totalColleges: 12,
    totalStudents: 15420,
    activePrincipals: 12,
    systemUsage: 8945,
    topPerformingCollege: "MIT College of Engineering",
    avgAttendance: 87.5,
    avgPerformance: 82.3,
  };

  const collegeData = [
    { id: 1, name: "MIT College of Engineering", principal: "Dr. Rajesh Kumar", students: 2500, departments: 8, status: "Active", performance: 92 },
    { id: 2, name: "VIT Pune", principal: "Dr. Priya Sharma", students: 3200, departments: 10, status: "Active", performance: 88 },
    { id: 3, name: "COEP Pune", principal: "Dr. Amit Patel", students: 2800, departments: 9, status: "Active", performance: 90 },
    { id: 4, name: "PICT Pune", principal: "Dr. Sunita Desai", students: 2100, departments: 7, status: "Active", performance: 85 },
  ];

  const monthlyUsageData = [
    { month: "Jan", logins: 4000, activeUsers: 3200 },
    { month: "Feb", logins: 4500, activeUsers: 3600 },
    { month: "Mar", logins: 5200, activeUsers: 4100 },
    { month: "Apr", logins: 6100, activeUsers: 4800 },
    { month: "May", logins: 7200, activeUsers: 5600 },
    { month: "Jun", logins: 8945, activeUsers: 6800 },
  ];

  const performanceData = [
    { name: "Excellent (>85%)", value: 45, color: "#10b981" },
    { name: "Good (70-85%)", value: 35, color: "#3b82f6" },
    { name: "Average (60-70%)", value: 15, color: "#f59e0b" },
    { name: "Needs Improvement (<60%)", value: 5, color: "#ef4444" },
  ];

  const recentActivities = [
    { id: 1, action: "New college added", college: "VIIT Pune", time: "2 hours ago", type: "success" },
    { id: 2, action: "Principal assigned", college: "MIT COE", time: "5 hours ago", type: "info" },
    { id: 3, action: "System maintenance completed", college: "All", time: "1 day ago", type: "success" },
    { id: 4, action: "Performance report generated", college: "VIT Pune", time: "2 days ago", type: "info" },
  ];

  if (!user || user.role !== 'shiksan_mantri') {
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
      {/* Sidebar */}
      <EnhancedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className={cn("transition-all duration-300 ease-in-out lg:ml-64 flex flex-col min-h-screen")}>
        {/* Navbar */}
        <EnhancedNavbar
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          breadcrumbs={["Admin", "Dashboard"]}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 xl:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">System-wide overview and management</p>
                  </div>
                </div>
                <Button onClick={() => setLocation('/create-college')} className="bg-gradient-to-r from-blue-600 to-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New College
                </Button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-100">Total Colleges</CardTitle>
                  <Building2 className="h-5 w-5 text-blue-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalColleges}</div>
                  <p className="text-xs text-blue-200 mt-1">Across all regions</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-100">Total Students</CardTitle>
                  <GraduationCap className="h-5 w-5 text-green-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.totalStudents.toLocaleString()}</div>
                  <p className="text-xs text-green-200 mt-1">Active enrollments</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-100">Active Principals</CardTitle>
                  <Users className="h-5 w-5 text-purple-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.activePrincipals}</div>
                  <p className="text-xs text-purple-200 mt-1">Managing colleges</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-100">System Usage</CardTitle>
                  <Activity className="h-5 w-5 text-orange-200" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{dashboardStats.systemUsage.toLocaleString()}</div>
                  <p className="text-xs text-orange-200 mt-1">Daily active users</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Usage Trends */}
              <Card>
                <CardHeader>
                  <CardTitle>System Usage Trends</CardTitle>
                  <CardDescription>Monthly login and active user statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyUsageData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="logins" stroke="#3b82f6" strokeWidth={2} />
                      <Line type="monotone" dataKey="activeUsers" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Performance Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>College Performance Distribution</CardTitle>
                  <CardDescription>Overall academic performance across colleges</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={performanceData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {performanceData.map((entry, index) => (
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
              <Tabs defaultValue="colleges" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full lg:w-auto grid-cols-3 bg-gray-100">
                    <TabsTrigger value="colleges">Colleges</TabsTrigger>
                    <TabsTrigger value="activities">Recent Activities</TabsTrigger>
                    <TabsTrigger value="reports">Reports</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <TabsContent value="colleges" className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Managed Colleges</h3>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Analytics
                      </Button>
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>College Name</TableHead>
                          <TableHead>Principal</TableHead>
                          <TableHead>Students</TableHead>
                          <TableHead>Departments</TableHead>
                          <TableHead>Performance</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {collegeData.map((college) => (
                          <TableRow key={college.id}>
                            <TableCell className="font-medium">{college.name}</TableCell>
                            <TableCell>{college.principal}</TableCell>
                            <TableCell>{college.students.toLocaleString()}</TableCell>
                            <TableCell>{college.departments}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full",
                                      college.performance >= 85 ? "bg-green-500" :
                                      college.performance >= 70 ? "bg-blue-500" :
                                      college.performance >= 60 ? "bg-orange-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${college.performance}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{college.performance}%</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">{college.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setLocation(`/college/${college.id}`)}>
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

                <TabsContent value="activities" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Recent System Activities</h3>
                    <div className="space-y-3">
                      {recentActivities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <div className={cn(
                            "w-2 h-2 rounded-full mt-2",
                            activity.type === 'success' ? "bg-green-500" : "bg-blue-500"
                          )} />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{activity.action}</p>
                            <p className="text-sm text-gray-600">{activity.college}</p>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="p-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">System Reports</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-base">Monthly Performance Report</CardTitle>
                          <CardDescription>Comprehensive college performance analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            <Calendar className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-base">Student Enrollment Report</CardTitle>
                          <CardDescription>Enrollment trends and statistics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            <GraduationCap className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-base">System Usage Report</CardTitle>
                          <CardDescription>Platform usage and engagement metrics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            <Activity className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </CardContent>
                      </Card>

                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader>
                          <CardTitle className="text-base">NAAC/NBA Compliance</CardTitle>
                          <CardDescription>Accreditation readiness report</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button variant="outline" className="w-full">
                            <Award className="h-4 w-4 mr-2" />
                            Generate Report
                          </Button>
                        </CardContent>
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

export default EnhancedAdminDashboard;
