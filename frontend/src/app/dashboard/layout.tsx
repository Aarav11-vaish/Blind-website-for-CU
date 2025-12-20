"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import AuthGuard from "@/components/auth/AuthGuard";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <TooltipProvider>{children}</TooltipProvider>
    </AuthGuard>
  );
};

export default DashboardLayout;
