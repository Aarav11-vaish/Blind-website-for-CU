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
import { toast } from "@/components/ui/use-toast";

interface NavbarProps {
  onSidebarToggle?: () => void;
}

const Navbar = ({ onSidebarToggle }: NavbarProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const { isAuthenticated, logout, redirectToSignin } = useAuth();
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
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/dashboard/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-red-500 dark:bg-slate-800 border-b border-red-600 dark:border-slate-700 shadow-md" role="banner">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Mobile menu + Brand name */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            <button
              onClick={onSidebarToggle}
              className="md:hidden p-2 rounded-md text-white hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Toggle navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <h1 className="text-white text-2xl sm:text-3xl font-bold cursor-pointer">
              BlindCU
            </h1>
          </div>

          {/* Center: Search bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl mx-4 hidden sm:block" role="search">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none"
                aria-hidden="true"
              />
              <Input
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search communities, posts..."
                className="pl-10 w-full bg-white/10 border-white/20 text-white placeholder:text-gray-300 focus:bg-white/20 focus:border-white/40"
                aria-label="Search communities and posts"
                type="search"
                autoComplete="off"
              />
              {searchQuery && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2" aria-hidden="true">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                </div>
              )}
            </div>
          </form>

          {/* Mobile Search Button */}
          <button
            onClick={() => router.push('/dashboard/search')}
            className="sm:hidden p-2 rounded-md text-white hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Open search page"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Right: Notifications, Messages, Account */}
          <nav className="flex items-center space-x-1 flex-shrink-0" role="navigation" aria-label="User actions">
            {/* Notifications */}
            <button
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Notifications (Coming Soon)"
              disabled
            >
              <Bell className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>

            {/* Messages */}
            <button
              className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-white hover:text-white hover:bg-white/10 transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Messages (Coming Soon)"
              disabled
            >
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </button>

            {/* Profile Dropdown */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center space-x-2 p-2 rounded-md text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-red-500 dark:focus:ring-offset-slate-800 min-h-[44px] min-w-[44px]"
                    aria-label="User menu"
                    aria-haspopup="true"
                  >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center bg-white/20 border border-white/30" aria-hidden="true">
                      <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                    <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 transition-transform text-white hidden sm:block" aria-hidden="true" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56 bg-card border border-border shadow-lg">
                  <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="border-border" />
                  
                  <DropdownMenuItem onClick={handleProfileSettings} className="text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile Settings</span>
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={handlePreferences} className="text-muted-foreground hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Preferences</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="border-border" />

                  <DropdownMenuItem onClick={handleLogout} className="text-destructive hover:bg-destructive/10 focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/20">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;