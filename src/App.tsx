import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import AppLayout from "@/components/AppLayout";
import ProtectedRoute from "@/components/ProtectedRoute";
const Landing = lazy(() => import("@/pages/Landing"));
const Auth = lazy(() => import("@/pages/Auth"));
const OtpVerification = lazy(() => import("@/pages/OtpVerification"));
const IitVerification = lazy(() => import("@/pages/IitVerification"));
const Forum = lazy(() => import("@/pages/Forum"));
const CalendarPage = lazy(() => import("@/pages/CalendarPage"));
const Network = lazy(() => import("@/pages/Network"));
const Consult = lazy(() => import("@/pages/Consult"));
const Jobs = lazy(() => import("@/pages/Jobs"));
const Profile = lazy(() => import("@/pages/Profile"));
const Chats = lazy(() => import("@/pages/Chats"));
const Settings = lazy(() => import("@/pages/Settings"));
const Admin = lazy(() => import("@/pages/Admin"));
const Blogs = lazy(() => import("@/pages/Blogs"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const RouteFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-background" role="status" aria-label="Loading page">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

// Global QueryClient — data stays cached until explicit refresh
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 1000 * 60 * 10,
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      refetchOnReconnect: true,
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
          <Suspense fallback={<RouteFallback />}>
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
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
