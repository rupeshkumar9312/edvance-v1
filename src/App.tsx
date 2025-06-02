
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import Dashboard from "./pages/Dashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Classes from "./pages/Classes";
import Attendance from "./pages/Attendance";
import Fees from "./pages/Fees";
import Auth from "./pages/Auth";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="super-admin" element={
                <RoleProtectedRoute allowedRoles={['super_admin']}>
                  <SuperAdminDashboard />
                </RoleProtectedRoute>
              } />
              <Route path="students" element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Students />
                </RoleProtectedRoute>
              } />
              <Route path="teachers" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Teachers />
                </RoleProtectedRoute>
              } />
              <Route path="classes" element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Classes />
                </RoleProtectedRoute>
              } />
              <Route path="attendance" element={
                <RoleProtectedRoute allowedRoles={['admin', 'teacher']}>
                  <Attendance />
                </RoleProtectedRoute>
              } />
              <Route path="fees" element={
                <RoleProtectedRoute allowedRoles={['admin']}>
                  <Fees />
                </RoleProtectedRoute>
              } />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
