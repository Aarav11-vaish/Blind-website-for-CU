"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Grid,
  BookOpen,
  GraduationCap,
  Briefcase,
  Users,
  AlertTriangle,
  Star,
  FileText,
  TrendingUp,
  Plus,
  UsersIcon,
} from "lucide-react";
import { designTokens, cn, motionSafe, componentPatterns } from "@/lib/design-system";

interface SidebarProps {
  isCollapsed?: boolean;
  isMobile?: boolean;
  onClose?: () => void;
}

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category?: string;
}

const navigationItems: NavigationItem[] = [
  { id: "all", label: "All Posts", icon: Grid, href: "/dashboard" },
  { id: "create-post", label: "Create Post", icon: Plus, href: "/dashboard/create-post" },
  { id: "communities", label: "Communities", icon: UsersIcon, href: "/dashboard/communities" },
  { id: "academics", label: "Academics", icon: BookOpen, href: "/dashboard/academics" },
  { id: "exams", label: "Exams & Study", icon: GraduationCap, href: "/dashboard/exams" },
  { id: "placements", label: "Placements & Internships", icon: Briefcase, href: "/dashboard/placements" },
  { id: "campus", label: "Campus Life", icon: Users, href: "/dashboard/campus" },
  { id: "problems", label: "Problems & Rants", icon: AlertTriangle, href: "/dashboard/problems" },
  { id: "reviews", label: "Reviews", icon: Star, href: "/dashboard/reviews" },
  { id: "my-posts", label: "My Posts", icon: FileText, href: "/dashboard/my-posts" },
];

const Sidebar = ({ isCollapsed = false, isMobile = false, onClose }: SidebarProps) => {
  const pathname = usePathname();

  // Handle link click
  const handleLinkClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, href: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      window.location.href = href;
      if (isMobile && onClose) {
        onClose();
      }
    }
  };

  return (
    <aside
      className={cn(
        "w-full",
        isCollapsed ? 'hidden' : 'block',
        isMobile && designTokens.background.card,
        isMobile && 'h-full'
      )}
      role="complementary"
      aria-label="Navigation sidebar"
    >
      <div
        className={cn(
          "rounded-lg p-4",
          designTokens.background.card,
          "border",
          designTokens.border.default,
          designTokens.shadow.sm,
          designTokens.transition.all,
          isMobile && 'border-0 rounded-none h-full'
        )}
      >
        <nav
          className="flex flex-col space-y-2"
          role="navigation"
          aria-label="Main navigation"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={handleLinkClick}
                onKeyDown={(e) => handleKeyDown(e, item.href)}
                className={cn(
                  componentPatterns.navItem,
                  "transition-colors duration-200",
                  isActive && "bg-primary/20 text-primary font-semibold",
                  !isActive && designTokens.text.muted,
                  !isActive && "hover:bg-accent/50 hover:text-accent-foreground",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                )}
                aria-current={isActive ? 'page' : undefined}
                tabIndex={0}
              >
                <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cn(
          "my-6 border-t",
          designTokens.border.default
        )} role="separator" />

        <section className="space-y-3" aria-labelledby="trending-heading">
          <div
            className={cn(
              "flex items-center space-x-2",
              designTokens.text.primary
            )}
          >
            <TrendingUp className={cn(
              designTokens.text.brand,
              "h-5 w-5",
              motionSafe("animate-pulse")
            )} aria-hidden="true" />
            <h3 id="trending-heading" className="font-bold">Trending</h3>
          </div>

          <nav className="flex flex-col space-y-2 text-sm" role="navigation" aria-label="Trending topics">
            {['#Midterms', '#Internship', '#HostelFood'].map((tag, index) => (
              <button
                key={tag}
                className={cn(
                  "text-left cursor-pointer rounded px-2 py-1 flex items-center",
                  designTokens.text.muted,
                  "hover:text-primary focus:text-primary",
                  "transition-colors duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                  designTokens.accessibility.touchTarget
                )}
                aria-label={`View posts about ${tag.slice(1)}`}
              >
                {tag}
              </button>
            ))}
          </nav>
        </section>
      </div>
    </aside>
  );
};

export default Sidebar;
