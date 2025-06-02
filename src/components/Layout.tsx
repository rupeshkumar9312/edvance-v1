
import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";
import { 
  LayoutDashboard, 
  Users, 
  User, 
  BookOpen, 
  Calendar, 
  DollarSign, 
  Menu, 
  X,
  LogOut,
  Settings
} from "lucide-react";
import logo from "../../public/logo.png";
import {CardTitle} from "@/components/ui/card.tsx";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { userRole, hasRole, hasAnyRole } = useUserRole();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ['admin', 'teacher', 'student'] },
    { name: "Students", href: "/students", icon: Users, roles: ['admin', 'teacher'] },
    { name: "Teachers", href: "/teachers", icon: User, roles: ['admin'] },
    { name: "Classes", href: "/classes", icon: BookOpen, roles: ['admin', 'teacher'] },
    { name: "Attendance", href: "/attendance", icon: Calendar, roles: ['admin', 'teacher'] },
    { name: "Fee Management", href: "/fees", icon: DollarSign, roles: ['admin'] },
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'teacher': return 'bg-blue-100 text-blue-800';
      case 'student': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNavigation = navigation.filter(item => 
    hasAnyRole(item.roles as ('admin' | 'teacher' | 'student')[])
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
          <CardTitle className="font-bold text-blue-600 flex items-center justify-center">
            <img src={logo} alt="Logo" className="h-16 w-auto" />
          </CardTitle>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 mt-8 px-2">
          {filteredNavigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center px-4 py-3 mx-2 mb-1 rounded-lg transition-colors ${
                isActive(item.href)
                  ? "bg-blue-100 text-blue-700 border-r-4 border-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User info and logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">Welcome</p>
                {userRole && (
                  <Badge className={getRoleColor(userRole)}>
                    {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                  </Badge>
                )}
              </div>
              <p className="text-gray-500 truncate">{user?.email}</p>
            </div>
            <div className="flex gap-1">
              <ChangePasswordDialog>
                <Button
                  variant="outline"
                  size="sm"
                  className="p-2"
                  title="Change Password"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </ChangePasswordDialog>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="p-2"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-4 ml-auto">
              <div className="text-sm text-gray-500">
                Welcome back, {userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'User'}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
