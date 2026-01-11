import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Properties from "./pages/Properties";
import Students from "./pages/Students";
import RoomAllocation from "./pages/RoomAllocation";
import GatePasses from "./pages/GatePasses";
import MessManagement from "./pages/MessManagement";
import Billing from "./pages/Billing";
import Maintenance from "./pages/Maintenance";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/properties" element={<Properties />} />
          <Route path="/dashboard/students" element={<Students />} />
          <Route path="/dashboard/rooms" element={<RoomAllocation />} />
          <Route path="/dashboard/passes" element={<GatePasses />} />
          <Route path="/dashboard/mess" element={<MessManagement />} />
          <Route path="/dashboard/billing" element={<Billing />} />
          <Route path="/dashboard/maintenance" element={<Maintenance />} />
          <Route path="/dashboard/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
