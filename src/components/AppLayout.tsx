import { Outlet, useLocation, Navigate } from "react-router-dom";
import BottomNav from "./BottomNav";
import AppHeader from "./AppHeader";
import DesktopSidebar from "./DesktopSidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePrefetch } from "@/hooks/usePrefetch";
import LockedModeOverlay from "./LockedModeOverlay";
import PostVerifyOnboarding from "./PostVerifyOnboarding";

const AppLayout = () => {
  const { user, profile, isVerified, refetchProfile } = useAuth();
  const location = useLocation();

  // Prefetch all critical data on login
  usePrefetch(user?.id, profile);

  // If verified but onboarding not completed, show onboarding wizard
  const needsOnboarding = user && isVerified && profile && !profile.onboarding_completed;

  // Block unverified users on all pages except settings/profile/iit-verify
  const allowedUnverified = ["/settings", "/profile", "/iit-verify"];
  const isProtectedPage = !allowedUnverified.some(p => location.pathname.startsWith(p));
  const showLockedOverlay = user && !isVerified && isProtectedPage;

  // Show onboarding wizard if verified but not onboarded
  if (needsOnboarding) {
    return (
      <PostVerifyOnboarding
        derivedIit={profile?.iit_name}
        onComplete={async () => {
          await refetchProfile();
          // Force reload to clear all stale caches
          window.location.href = "/cirkle-forum";
        }}
      />
    );
  }

  const isForum = location.pathname.startsWith("/cirkle-forum");

  return (
    <div className="fixed inset-0 bg-background flex w-full overflow-hidden">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-hidden">
        {!isForum && <AppHeader />}
        <main className={`flex-1 ${isForum ? '' : 'pb-[72px]'} lg:pb-0 overflow-y-auto overflow-x-hidden overscroll-y-contain`} style={{ WebkitOverflowScrolling: 'touch' }}>
          <Outlet />
        </main>
        {!isForum && <BottomNav />}
        {showLockedOverlay && <LockedModeOverlay />}
      </div>
    </div>
  );
};

export default AppLayout;
