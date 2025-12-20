"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, MessageCircle, Search, User, Menu, LogOut, Settings, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { designTokens, cn, motionSafe, componentPatterns } from "@/lib/design-system";
import { toast } from "@/components/ui/use-toast";

interface NavbarProps {
  onSidebarToggle?: () => void;
}

const Navbar = ({ onSidebarToggle }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { user, isAuthenticated, logout, redirectToSignin } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
      variant: "info",
    });
    redirectToSignin(false);
  };

  const handleProfileSettings = () => {
    router.push("/dashboard/profile");
  };

  const handlePreferences = () => {
    router.push("/dashboard/preferences");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Add visual feedback for search functionality
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Implement search functionality here
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-10",
        "bg-primary dark:bg-background",
        "border-b",
        designTokens.border.default,
        designTokens.shadow.md,
        designTokens.transition.all
      )}
      role="banner"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            {/* Mobile sidebar toggle */}
            <button
              onClick={onSidebarToggle}
              className={cn(
                "md:hidden p-2 rounded-md button-press",
                "text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground",
                "hover:bg-white/10 dark:hover:bg-accent",
                designTokens.transition.default,
                designTokens.focus.ring,
                designTokens.accessibility.touchTarget,
                motionSafe("hover:scale-105")
              )}
              aria-label="Toggle navigation menu"
              aria-expanded={false}
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className={cn(
              "text-white dark:text-foreground",
              "text-3xl font-bold",
              designTokens.transition.default,
              motionSafe("hover:scale-105 cursor-pointer")
            )}>
              BlindCU
            </h1>
          </div>

          {/* Enhanced Search with Visual Feedback */}
          <div className="flex-1 max-w-xl mx-4 hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative" role="search">
              <Search
                className={`
                  absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors pointer-events-none
                  ${isSearchFocused || searchQuery
                    ? 'text-primary dark:text-primary'
                    : 'text-muted-foreground'
                  }
                `}
                aria-hidden="true"
              />

              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search communities, posts..."
                className={cn(
                  componentPatterns.input,
                  "pl-10",
                  designTokens.transition.all,
                  isSearchFocused && "ring-2 ring-primary border-primary shadow-sm",
                  !isSearchFocused && designTokens.hover.border,
                  motionSafe("focus:scale-[1.02]")
                )}
                aria-label="Search communities and posts"
                type="search"
                autoComplete="off"
              />

              {searchQuery && (
                <div
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  aria-hidden="true"
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    designTokens.background.primary,
                    motionSafe(designTokens.animation.pulse)
                  )} />
                </div>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <nav className="flex items-center space-x-2" role="navigation" aria-label="User actions">
            {/* Notifications */}
            <button
              className={cn(
                componentPatterns.interactiveButton,
                "p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
                "text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground",
                "hover:bg-white/10 dark:hover:bg-accent",
                motionSafe("hover:scale-105 active:scale-95")
              )}
              aria-label="Notifications (Coming Soon)"
              disabled
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* Messages */}
            <button
              className={cn(
                componentPatterns.interactiveButton,
                "p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed",
                "text-white/80 hover:text-white dark:text-muted-foreground dark:hover:text-foreground",
                "hover:bg-white/10 dark:hover:bg-accent",
                motionSafe("hover:scale-105 active:scale-95")
              )}
              aria-label="Messages (Coming Soon)"
              disabled
            >
              <MessageCircle className="h-5 w-5" />
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-md",
                      "text-white dark:text-foreground",
                      "hover:bg-white/10 dark:hover:bg-accent",
                      designTokens.transition.default,
                      designTokens.focus.ring,
                      designTokens.accessibility.touchTarget,
                      motionSafe("hover:scale-105")
                    )}
                    aria-label="User menu"
                    aria-haspopup="true"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center",
                        "bg-white/20 border border-white/30 dark:bg-primary/10 dark:border-primary/20",
                        designTokens.transition.default,
                        motionSafe("hover:bg-white/30 dark:hover:bg-primary/20")
                      )}
                      aria-hidden="true"
                    >
                      <User className={cn("h-4 w-4", "text-white dark:text-primary")} />
                    </div>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform text-white dark:text-foreground",
                      motionSafe("group-hover:rotate-180")
                    )} aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  className={cn(
                    "w-56",
                    designTokens.background.card,
                    "border",
                    designTokens.border.default,
                    designTokens.shadow.lg,
                    motionSafe("animate-in slide-in-from-top-2 duration-200")
                  )}
                >
                  <DropdownMenuLabel className={designTokens.text.primary}>
                    My Account
                  </DropdownMenuLabel>

                  <DropdownMenuSeparator className={designTokens.border.default} />

                  <DropdownMenuItem
                    onClick={handleProfileSettings}
                    className={cn(
                      designTokens.text.muted,
                      designTokens.hover.background,
                      designTokens.transition.default,
                      motionSafe("hover:scale-[1.02]"),
                      "cursor-pointer"
                    )}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handlePreferences}
                    className={cn(
                      designTokens.text.muted,
                      designTokens.hover.background,
                      designTokens.transition.default,
                      motionSafe("hover:scale-[1.02]"),
                      "cursor-pointer"
                    )}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className={designTokens.border.default} />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className={cn(
                      designTokens.text.destructive,
                      "hover:bg-destructive/10 focus:bg-destructive/10",
                      designTokens.transition.default,
                      motionSafe("hover:scale-[1.02]")
                    )}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  designTokens.background.muted,
                  designTokens.transition.default
                )}
              >
                <User
                  className={cn(
                    "h-4 w-4",
                    designTokens.text.primary
                  )}
                />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;