import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Customers from "./pages/Customers";
import CustomerNew from "./pages/CustomerNew";
import CustomerProfile from "./pages/CustomerProfile";
import CustomerEdit from "./pages/CustomerEdit";
import Loans from "./pages/Loans";
import ChitFunds from "./pages/ChitFunds";
import Payments from "./pages/Payments";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import SettingsPage from "./pages/Settings";
import Users from "./pages/Users";
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
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute permission="customer:view"><AppLayout><Customers /></AppLayout></ProtectedRoute>} />
            <Route path="/customers/new" element={<ProtectedRoute permission="customer:create"><AppLayout><CustomerNew /></AppLayout></ProtectedRoute>} />
            <Route path="/customers/:id" element={<ProtectedRoute permission="customer:view"><AppLayout><CustomerProfile /></AppLayout></ProtectedRoute>} />
            <Route path="/customers/:id/edit" element={<ProtectedRoute permission="customer:edit"><AppLayout><CustomerEdit /></AppLayout></ProtectedRoute>} />
            <Route path="/loans" element={<ProtectedRoute permission="loan:view"><AppLayout><Loans /></AppLayout></ProtectedRoute>} />
            <Route path="/chit-funds" element={<ProtectedRoute permission="chit:view"><AppLayout><ChitFunds /></AppLayout></ProtectedRoute>} />
            <Route path="/payments" element={<ProtectedRoute permission="payment:view"><AppLayout><Payments /></AppLayout></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute permission="report:view"><AppLayout><Reports /></AppLayout></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><AppLayout><Notifications /></AppLayout></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><AppLayout><SettingsPage /></AppLayout></ProtectedRoute>} />
            <Route path="/users" element={<ProtectedRoute permission="user:view"><AppLayout><Users /></AppLayout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

