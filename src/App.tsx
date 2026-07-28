import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import OtpVerification from "@/pages/OtpVerification";
import IitVerification from "@/pages/IitVerification";
// import HomePage from "@/pages/HomePage"; // COMMENTED OUT — Forum is primary
import Forum from "@/pages/Forum";
import CalendarPage from "@/pages/CalendarPage";
import Network from "@/pages/Network";
import Consult from "@/pages/Consult";
import Jobs from "@/pages/Jobs";
import Profile from "@/pages/Profile";
import Chats from "@/pages/Chats";
import Settings from "@/pages/Settings";
import Admin from "@/pages/Admin";
import Blogs from "@/pages/Blogs";
import NotFound from "@/pages/NotFound";

// Global QueryClient — data stays cached until explicit refresh
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/otp-verify" element={<OtpVerification />} />
            <Route path="/iit-verify" element={<IitVerification />} />

            {/* App routes with layout — Forum is the primary product */}
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              {/* Forum — Discord-style, primary landing after login */}
              <Route path="/cirkle-forum" element={<Forum />} />
              <Route path="/cirkle-forum/*" element={<Forum />} />

              {/* Homepage COMMENTED OUT — redirect to forum */}
              {/* <Route path="/home" element={<HomePage />} /> */}
              <Route path="/home" element={<Navigate to="/cirkle-forum" replace />} />

              {/* Network */}
              <Route path="/network" element={<Network />} />
              <Route path="/network/connections" element={<Network />} />
              <Route path="/network/suggestions" element={<Network />} />

              {/* Consult / Mentoring */}
              <Route path="/consult" element={<Consult />} />
              <Route path="/consult/mentors" element={<Consult />} />
              <Route path="/consult/bookings" element={<Consult />} />

              {/* Jobs */}
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/jobs/internships" element={<Jobs />} />
              <Route path="/jobs/full-time" element={<Jobs />} />
              <Route path="/jobs/part-time" element={<Jobs />} />
              <Route path="/jobs/remote" element={<Jobs />} />

              {/* Calendar & Blogs */}
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route path="/blogs/:slug" element={<Blogs />} />
            </Route>

            {/* Profile routes */}
            <Route path="/u/:slug" element={<Profile />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/profile/:userId" element={<Profile />} />

            {/* Utility routes */}
            <Route path="/chats" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
            <Route path="/chats/:roomId" element={<ProtectedRoute><Chats /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/account" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/settings/privacy" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/admin/reports" element={<ProtectedRoute><Admin /></ProtectedRoute>} />

            {/* Legacy redirects */}
            <Route path="/forum" element={<Navigate to="/cirkle-forum" replace />} />
            <Route path="/forum/*" element={<Navigate to="/cirkle-forum" replace />} />

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
