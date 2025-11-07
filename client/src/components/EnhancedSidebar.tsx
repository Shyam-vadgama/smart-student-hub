import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  GraduationCap,
  LayoutDashboard,
  Trophy,
  ClipboardCheck,
  FileText,
  BarChart3,
  Users,
  LogOut,
  Users2,
  Code,
  ChevronDown,
  ChevronRight,
  X,
  BookOpen,
  Calendar,
  Settings,
  Building2,
  UserCog,
  FolderGit2,
  MessageSquare,
  Target,
  Shield,
  FileSpreadsheet,
  Briefcase,
  GitBranch,
  Zap,
  PieChart,
  School,
  UserPlus,
  ClipboardList,
  TrendingUp,
  Bell,
  Lock,
} from "lucide-react";

interface EnhancedSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
  roles: string[];
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  children?: NavItem[];
}

export default function EnhancedSidebar({ isOpen = true, onClose, collapsed = false }: EnhancedSidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({
    practice: false,
    academics: true,
    reports: false,
  });

  if (!user) return null;

  // Role-based navigation structure
  const getNavigationSections = (): NavSection[] => {
    const sections: NavSection[] = [];

    // ADMIN (Shikshan Mantri) Navigation
    if (user.role === 'shiksan_mantri') {
      sections.push({
        title: "Core",
        roles: ['shiksan_mantri'],
        items: [
          { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
          { name: "Manage Colleges", href: "/create-college", icon: Building2 },
          { name: "Principals Management", href: "/principals", icon: UserCog },
        ]
      });
      sections.push({
        title: "Reports & Analytics",
        roles: ['shiksan_mantri'],
        items: [
          { name: "System Analytics", href: "/admin/analytics", icon: BarChart3 },
          { name: "Performance Reports", href: "/admin/reports", icon: FileSpreadsheet },
        ]
      });
      sections.push({
        title: "Settings",
        roles: ['shiksan_mantri'],
        items: [
          { name: "App Configuration", href: "/admin/settings", icon: Settings },
          { name: "Access Logs", href: "/admin/logs", icon: Lock },
        ]
      });
    }

    // PRINCIPAL Navigation
    if (user.role === 'principal') {
      sections.push({
        title: "Core",
        roles: ['principal'],
        items: [
          { name: "Dashboard", href: "/principal-dashboard", icon: LayoutDashboard },
          { name: "Departments", href: "/create-department", icon: Building2 },
          { name: "HOD Assignments", href: "/hod-assignments", icon: UserCog },
          { name: "Student Overview", href: "/students-overview", icon: Users },
        ]
      });
      sections.push({
        title: "Reports",
        roles: ['principal'],
        items: [
          { name: "College Analytics", href: "/principal/analytics", icon: PieChart },
          { name: "NAAC/NBA Data", href: "/principal/naac", icon: FileSpreadsheet },
          { name: "Announcements", href: "/announcements", icon: Bell },
        ]
      });
      sections.push({
        title: "Settings",
        roles: ['principal'],
        items: [
          { name: "College Settings", href: "/principal/settings", icon: Settings },
        ]
      });
    }

    // HOD Navigation
    if (user.role === 'hod') {
      sections.push({
        title: "Core",
        roles: ['hod'],
        items: [
          { name: "Dashboard", href: "/hod-dashboard", icon: LayoutDashboard },
          { name: "Faculty Management", href: "/users", icon: Users },
          { name: "Student Management", href: "/students", icon: Users2 },
        ]
      });
      sections.push({
        title: "Academics",
        roles: ['hod'],
        items: [
          { name: "Subjects & Classes", href: "/create-subject", icon: BookOpen },
          { name: "Classrooms", href: "/create-classroom", icon: School },
          { name: "Timetable", href: "/create-timetable", icon: Calendar },
          { name: "Attendance Overview", href: "/hod/attendance", icon: ClipboardCheck },
          { name: "Marks & Assessments", href: "/hod/marks", icon: FileText },
        ]
      });
      sections.push({
        title: "Projects & Achievements",
        roles: ['hod'],
        items: [
          { name: "Review Achievements", href: "/review", icon: Trophy },
          { name: "Projects Overview", href: "/hod/projects", icon: FolderGit2 },
          { name: "Dynamic Forms", href: "/forms", icon: FileText },
        ]
      });
      sections.push({
        title: "Reports",
        roles: ['hod'],
        items: [
          { name: "Department Analytics", href: "/analytics", icon: BarChart3 },
          { name: "Skill Trends", href: "/hod/skills", icon: TrendingUp },
          { name: "Download Reports", href: "/hod/download", icon: FileSpreadsheet },
        ]
      });
      sections.push({
        title: "Settings",
        roles: ['hod'],
        items: [
          { name: "Department Settings", href: "/hod/settings", icon: Settings },
          { name: "Approval Workflows", href: "/approval-workflows", icon: GitBranch },
        ]
      });
    }

    // FACULTY Navigation
    if (user.role === 'faculty') {
      sections.push({
        title: "Core",
        roles: ['faculty'],
        items: [
          { name: "Dashboard", href: "/faculty-dashboard", icon: LayoutDashboard },
          { name: "My Subjects", href: "/faculty/subjects", icon: BookOpen },
        ]
      });
      sections.push({
        title: "Academics",
        roles: ['faculty'],
        items: [
          { name: "Attendance Entry", href: "/attendance", icon: ClipboardCheck },
          { name: "Marks Entry", href: "/faculty/marks", icon: FileText },
          { name: "Timetable", href: "/faculty/timetable", icon: Calendar },
        ]
      });
      sections.push({
        title: "Student Work",
        roles: ['faculty'],
        items: [
          { name: "Verify Achievements", href: "/review", icon: Trophy },
          { name: "Review Projects", href: "/faculty/projects", icon: FolderGit2 },
          { name: "Approval Requests", href: "/approval-requests", icon: ClipboardList },
        ]
      });
      sections.push({
        title: "Tools",
        roles: ['faculty'],
        items: [
          { name: "Create Practice Problems", href: "/leetcode/create", icon: Code },
          { name: "View Submissions", href: "/faculty/submissions", icon: FileSpreadsheet },
        ]
      });
      sections.push({
        title: "Reports",
        roles: ['faculty'],
        items: [
          { name: "My Reports", href: "/faculty/reports", icon: BarChart3 },
        ]
      });
    }

    // STUDENT Navigation
    if (user.role === 'student') {
      sections.push({
        title: "Core",
        roles: ['student'],
        items: [
          { name: "Dashboard", href: "/student-dashboard", icon: LayoutDashboard },
          { name: "My Profile", href: "/profile", icon: Users },
        ]
      });
      sections.push({
        title: "My Work",
        roles: ['student'],
        items: [
          { name: "My Projects", href: "/achievements", icon: FolderGit2, badge: "New" },
          { name: "Achievements", href: "/achievements", icon: Trophy },
          { name: "Resume Builder", href: "/resume-builder", icon: FileText },
        ]
      });
      sections.push({
        title: "Academics",
        roles: ['student'],
        items: [
          { name: "My Subjects", href: "/student/subjects", icon: BookOpen },
          { name: "Attendance", href: "/student-dashboard?tab=attendance", icon: ClipboardCheck },
          { name: "Marks", href: "/student-dashboard?tab=marks", icon: FileText },
          { name: "Timetable", href: "/student-dashboard?tab=timetable", icon: Calendar },
          { name: "Available Forms", href: "/student/forms", icon: ClipboardList },
        ]
      });
      sections.push({
        title: "Practice & Learn",
        roles: ['student'],
        items: [
          { name: "Skill Practice", href: "/leetcode", icon: Code },
          { name: "Coding Challenges", href: "/leetcode", icon: Zap },
          { name: "Business Problems", href: "/business-problems", icon: Briefcase },
        ]
      });
      sections.push({
        title: "Community",
        roles: ['student'],
        items: [
          { name: "Discussion Feed", href: "/feed", icon: MessageSquare },
          { name: "Leaderboard", href: "/leaderboard", icon: Target },
        ]
      });
    }

    return sections.filter(section => section.roles.includes(user.role));
  };

  const navigationSections = getNavigationSections();

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle.toLowerCase()]: !prev[sectionTitle.toLowerCase()]
    }));
  };

  const handleNavigation = (href: string) => {
    setLocation(href);
    if (onClose) onClose();
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'hod': return 'Head of Department';
      case 'faculty': return 'Faculty';
      case 'student': return 'Student';
      case 'principal': return 'Principal';
      case 'shiksan_mantri': return 'Admin';
      default: return role;
    }
  };

  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const SidebarContent = () => (
    <>
      {/* Logo and Brand */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-gray-900">Smart Hub</h1>
                <p className="text-xs text-gray-500">{getRoleDisplay(user.role)}</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
              <span className="text-sm font-bold text-gray-800">
                {getUserInitials(user.name)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Sections */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          {navigationSections.map((section) => (
            <div key={section.title}>
              {/* Section Header */}
              <div className="mb-2">
                {collapsed ? (
                  <div className="h-px bg-gray-200 my-2" />
                ) : (
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {section.title}
                  </h3>
                )}
              </div>

              {/* Section Items */}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href || location.startsWith(item.href + '/');

                  if (collapsed) {
                    return (
                      <li key={item.name}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant={isActive ? "default" : "ghost"}
                              size="icon"
                              className={cn(
                                "w-full",
                                isActive
                                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                              )}
                              onClick={() => handleNavigation(item.href)}
                            >
                              <Icon className="h-5 w-5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </li>
                    );
                  }

                  return (
                    <li key={item.name}>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start font-normal",
                          isActive
                            ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                            : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        )}
                        onClick={() => handleNavigation(item.href)}
                      >
                        <Icon className="mr-3 h-4 w-4" />
                        {item.name}
                        {item.badge && (
                          <Badge className="ml-auto bg-green-500 text-white text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </ScrollArea>

      {/* Logout */}
      <div className="p-3 border-t border-gray-200">
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Logout</p>
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 font-normal"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="mr-3 h-4 w-4" />
            {logoutMutation.isPending ? "Logging out..." : "Logout"}
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-lg",
          collapsed ? "w-16" : "w-64",
          !isOpen && "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarContent />
      </div>
    </>
  );
}
