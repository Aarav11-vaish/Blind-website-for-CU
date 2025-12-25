"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Handle keyboard navigation for sidebar toggle
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && !isSidebarCollapsed && isMobile) {
      setIsSidebarCollapsed(true);
    }
  };

  return (
    <div className="min-h-screen bg-background" onKeyDown={handleKeyDown}>
      {/* Skip to main content link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to main content
      </a>

      {/* Header Bar */}
      <Navbar onSidebarToggle={handleSidebarToggle} />

      {/* Mobile sidebar overlay */}
      {isMobile && !isSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Main Layout Container */}
      <main
        id="main-content"
        className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        role="main"
        aria-label="Dashboard content"
      >
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Navigation Sidebar */}
          <aside
            className={`col-span-12 md:col-span-3 lg:col-span-3 ${
              isSidebarCollapsed ? 'hidden md:block' : 'block'
            } ${
              isMobile && !isSidebarCollapsed ? 'fixed inset-y-0 left-0 z-50 w-64 md:relative md:w-auto' : ''
            }`}
            role="navigation"
            aria-label="Main navigation"
          >
            <div className={`${isMobile ? 'h-full overflow-y-auto' : 'sticky top-24'}`}>
              <Sidebar
                isCollapsed={isSidebarCollapsed}
                isMobile={isMobile}
                onClose={() => setIsSidebarCollapsed(true)}
              />
            </div>
          </aside>

          {/* Main Content Area */}
          <section
            className={`col-span-12 lg:col-span-9 ${
              isSidebarCollapsed ? 'md:col-span-12' : 'md:col-span-9'
            } relative`}
            role="region"
            aria-label="Main content area"
          >
            <div className="space-y-6">
              {children}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;