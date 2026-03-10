import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Solutions from "./pages/Solutions";
import FeaturesPage from "./pages/FeaturesPage";
import Pricing from "./pages/Pricing";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Students from "./pages/Students";
import RoomAllocation from "./pages/RoomAllocation";
import GatePasses from "./pages/GatePasses";
import MessManagement from "./pages/MessManagement";
import Billing from "./pages/Billing";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import DemoPayments from "./pages/DemoPayments";
import NotFound from "./pages/NotFound";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentGatePasses from "./pages/student/StudentGatePasses";
import StudentInvoices from "./pages/student/StudentInvoices";
import StudentComplaints from "./pages/student/StudentComplaints";
import StudentMess from "./pages/student/StudentMess";
import StudentMaintenance from "./pages/student/StudentMaintenance";
import StudentNotices from "./pages/student/StudentNotices";
import StudentProfile from "./pages/student/StudentProfile";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/solutions" element={<Solutions />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Admin / Staff Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard/properties" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Properties /></ProtectedRoute>} />
            <Route path="/dashboard/students" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Students /></ProtectedRoute>} />
            <Route path="/dashboard/rooms" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><RoomAllocation /></ProtectedRoute>} />
            <Route path="/dashboard/passes" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><GatePasses /></ProtectedRoute>} />
            <Route path="/dashboard/mess" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><MessManagement /></ProtectedRoute>} />
            <Route path="/dashboard/billing" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Billing /></ProtectedRoute>} />
            <Route path="/dashboard/maintenance" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Maintenance /></ProtectedRoute>} />
            <Route path="/dashboard/payments" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><DemoPayments /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><Settings /></ProtectedRoute>} />

            {/* Student Dashboard */}
            <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />
            <Route path="/student/passes" element={<ProtectedRoute allowedRoles={['student']}><StudentGatePasses /></ProtectedRoute>} />
            <Route path="/student/invoices" element={<ProtectedRoute allowedRoles={['student']}><StudentInvoices /></ProtectedRoute>} />
            <Route path="/student/complaints" element={<ProtectedRoute allowedRoles={['student']}><StudentComplaints /></ProtectedRoute>} />
            <Route path="/student/mess" element={<ProtectedRoute allowedRoles={['student']}><StudentMess /></ProtectedRoute>} />
            <Route path="/student/maintenance" element={<ProtectedRoute allowedRoles={['student']}><StudentMaintenance /></ProtectedRoute>} />
            <Route path="/student/notices" element={<ProtectedRoute allowedRoles={['student']}><StudentNotices /></ProtectedRoute>} />
            <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;