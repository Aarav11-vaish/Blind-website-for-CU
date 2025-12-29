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
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  { id: "search", label: "Search", icon: Search, href: "/dashboard/search" },
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

  const trendingTags = ["#academics", "#placements", "#campus", "#exams", "#internships"];

  return (
    <aside
      className={cn(
        "w-full",
        isCollapsed ? 'hidden' : 'block',
        isMobile && "bg-card h-full"
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <nav
        className={cn(
          "rounded-lg p-4 bg-card border border-border shadow-sm transition-all duration-200",
          isMobile && 'border-0 rounded-none h-full'
        )}
      >
        <ul className="space-y-2" role="list">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.id} role="listitem">
                <Link
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md",
                    "transition-colors duration-200",
                    isActive && "bg-primary/20 text-primary font-semibold",
                    !isActive && "text-muted-foreground",
                    !isActive && "hover:bg-accent/50 hover:text-accent-foreground",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className={cn(
          "my-6 border-t border-border"
        )} role="separator" />

        <section aria-labelledby="trending-heading">
          <h3
            id="trending-heading"
            className={cn(
              "flex items-center space-x-2 text-foreground"
            )}
          >
            <TrendingUp className={cn(
              "text-primary h-5 w-5 animate-pulse"
            )} aria-hidden="true" />
            <span className="font-bold">Trending</span>
          </h3>
          <ul className="mt-3 space-y-1" role="list">
            {trendingTags.map((tag, index) => (
              <li key={index} role="listitem">
                <button
                  type="button"
                  className={cn(
                    "text-left cursor-pointer rounded px-2 py-1 flex items-center",
                    "text-muted-foreground hover:text-primary focus:text-primary",
                    "transition-colors duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2",
                    "min-h-[44px] min-w-[44px]"
                  )}
                  aria-label={`View posts about ${tag.slice(1)}`}
                >
                  {tag}
                </button>
              </li>
            ))}
          </ul>
        </section>
      </nav>
    </aside>
  );
};

export default Sidebar;