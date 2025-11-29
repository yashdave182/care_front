import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import AdminDashboard from "./pages/AdminDashboard";
import NurseDashboard from "./pages/NurseDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import CleaningPage from "./pages/Cleaning";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/setup" element={<Setup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/nurse-dashboard" element={<NurseDashboard />} />
          <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
          <Route path="/cleaning" element={<CleaningPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
