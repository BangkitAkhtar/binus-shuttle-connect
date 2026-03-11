import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentBookings from "./pages/student/Bookings";
import StudentProfile from "./pages/student/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSchedules from "./pages/admin/Schedules";
import AdminUsers from "./pages/admin/Users";
import AdminBookings from "./pages/admin/Bookings";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white text-xl" style={{ background: 'var(--gradient-primary)' }}>B</div>
          <p className="text-muted-foreground text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<LoginPage />} />
      </Routes>
    );
  }

  return (
    <Layout>
      <Routes>
        {/* Student */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/bookings" element={<StudentBookings />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Admin/Staff */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/schedules" element={<AdminSchedules />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />

        {/* Default redirect */}
        <Route path="/" element={
          user.role === 'student' ? <Navigate to="/student/dashboard" replace /> :
          <Navigate to="/admin/dashboard" replace />
        } />
        <Route path="*" element={
          user.role === 'student' ? <Navigate to="/student/dashboard" replace /> :
          <Navigate to="/admin/dashboard" replace />
        } />
      </Routes>
    </Layout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
