import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ScrollToTop } from "@/components/ScrollToTop";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayoutRoute } from "@/components/dashboard/DashboardLayoutRoute";
import { LandingLayout } from "@/components/landing/LandingLayout";
import { StudentLayoutRoute } from "@/components/student/StudentLayoutRoute";
import { SuperAdminLayoutRoute } from "@/components/superadmin/SuperAdminLayoutRoute";
import { LayoutProvider } from "@/contexts/LayoutContext";

import Pricing from "./pages/Pricing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Solutions from "./pages/Solutions";
import FeaturesPage from "./pages/FeaturesPage";
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
import Complaints from "./pages/Complaints";
import Payroll from "./pages/Payroll";
import Accounting from "./pages/Accounting";
import Admissions from "./pages/Admissions";
import Receivables from "./pages/Receivables";
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

// Super Admin pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import SuperAdminUsers from "./pages/superadmin/SuperAdminUsers";
import SuperAdminNotices from "./pages/superadmin/SuperAdminNotices";
import SuperAdminOrganizations from "./pages/superadmin/SuperAdminOrganizations";
import SuperAdminReports from "./pages/superadmin/SuperAdminReports";

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
            {/* Landing pages - shared Navbar/Footer layout */}
            <Route element={<LandingLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
            </Route>

            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Admin / Staff Dashboard - shared layout */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin', 'tenant_admin', 'warden']}><DashboardLayoutRoute /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/properties" element={<Properties />} />
              <Route path="/dashboard/students" element={<Students />} />
              <Route path="/dashboard/rooms" element={<RoomAllocation />} />
              <Route path="/dashboard/passes" element={<GatePasses />} />
              <Route path="/dashboard/mess" element={<MessManagement />} />
              <Route path="/dashboard/billing" element={<Billing />} />
              <Route path="/dashboard/payroll" element={<Payroll />} />
              <Route path="/dashboard/accounting" element={<Accounting />} />
              <Route path="/dashboard/admissions" element={<Admissions />} />
              <Route path="/dashboard/receivables" element={<Receivables />} />
              <Route path="/dashboard/maintenance" element={<Maintenance />} />
              <Route path="/dashboard/complaints" element={<Complaints />} />
              <Route path="/dashboard/settings" element={<Settings />} />
            </Route>

            {/* Student Dashboard - shared layout */}
            <Route element={<ProtectedRoute allowedRoles={['student']}><StudentLayoutRoute /></ProtectedRoute>}>
              <Route path="/student" element={<StudentDashboard />} />
              <Route path="/student/passes" element={<StudentGatePasses />} />
              <Route path="/student/invoices" element={<StudentInvoices />} />
              <Route path="/student/complaints" element={<StudentComplaints />} />
              <Route path="/student/mess" element={<StudentMess />} />
              <Route path="/student/maintenance" element={<StudentMaintenance />} />
              <Route path="/student/notices" element={<StudentNotices />} />
              <Route path="/student/profile" element={<StudentProfile />} />
            </Route>

            {/* Super Admin Routes - shared layout */}
            <Route element={<ProtectedRoute allowedRoles={['super_admin']}><SuperAdminLayoutRoute /></ProtectedRoute>}>
              <Route path="/superadmin" element={<SuperAdminDashboard />} />
              <Route path="/superadmin/organizations" element={<SuperAdminOrganizations />} />
              <Route path="/superadmin/properties" element={<LayoutProvider><Properties /></LayoutProvider>} />
              <Route path="/superadmin/users" element={<SuperAdminUsers />} />
              <Route path="/superadmin/complaints" element={<LayoutProvider><Complaints /></LayoutProvider>} />
              <Route path="/superadmin/notices" element={<SuperAdminNotices />} />
              <Route path="/superadmin/reports" element={<SuperAdminReports />} />
              <Route path="/superadmin/settings" element={<LayoutProvider><Settings /></LayoutProvider>} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
