"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from "@/components/auth/AuthGuard";
import RouteErrorBoundary from "@/components/error/RouteErrorBoundary";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <RouteErrorBoundary routeName="Dashboard" enableErrorReporting={true}>
        <TooltipProvider>{children}</TooltipProvider>
      </RouteErrorBoundary>
    </AuthGuard>
  );
};

export default DashboardLayout;
