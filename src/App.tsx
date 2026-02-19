import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import LoginPage from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentSchedule from "./pages/student/Schedule";
import StudentBookings from "./pages/student/Bookings";
import StudentProfile from "./pages/student/Profile";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverPassengers from "./pages/driver/Passengers";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminSchedules from "./pages/admin/Schedules";
import AdminUsers from "./pages/admin/Users";
import AdminDrivers from "./pages/admin/Drivers";

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
        <Route path="/student/schedule" element={<StudentSchedule />} />
        <Route path="/student/bookings" element={<StudentBookings />} />
        <Route path="/student/profile" element={<StudentProfile />} />

        {/* Driver */}
        <Route path="/driver/dashboard" element={<DriverDashboard />} />
        <Route path="/driver/passengers" element={<DriverPassengers />} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/schedules" element={<AdminSchedules />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/drivers" element={<AdminDrivers />} />

        {/* Default redirect */}
        <Route path="/" element={
          user.role === 'student' ? <Navigate to="/student/dashboard" replace /> :
          user.role === 'driver' ? <Navigate to="/driver/dashboard" replace /> :
          <Navigate to="/admin/dashboard" replace />
        } />
        <Route path="*" element={
          user.role === 'student' ? <Navigate to="/student/dashboard" replace /> :
          user.role === 'driver' ? <Navigate to="/driver/dashboard" replace /> :
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
