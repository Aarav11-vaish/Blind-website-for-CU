"use client";

import React, { useState } from "react";
import { SearchQuery, Community } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Filter, X, Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SearchFiltersProps {
  filters: Omit<SearchQuery, "text">;
  onFiltersChange: (filters: Omit<SearchQuery, "text">) => void;
  communities?: Community[];
  disabled?: boolean;
  className?: string;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  communities = [],
  disabled = false,
  className,
}: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const handleSortChange = (sortBy: "date" | "likes" | "comments") => {
    onFiltersChange({ ...filters, sortBy, page: 1 });
  };

  const handleCommunityChange = (communityId: string) => {
    onFiltersChange({
      ...filters,
      communityId: communityId === "all" ? undefined : communityId,
      page: 1,
    });
  };

  const handleDateFromChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: date || new Date(),
        to: filters.dateRange?.to || new Date(),
      },
      page: 1,
    });
    setDateFromOpen(false);
  };

  const handleDateToChange = (date: Date | undefined) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        from: filters.dateRange?.from || new Date(),
        to: date || new Date(),
      },
      page: 1,
    });
    setDateToOpen(false);
  };

  const clearDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: undefined,
      page: 1,
    });
  };

  const clearCommunityFilter = () => {
    onFiltersChange({
      ...filters,
      communityId: undefined,
      page: 1,
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      sortBy: "date",
      page: 1,
      limit: filters.limit,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.communityId) count++;
    if (filters.dateRange) count++;
    if (filters.sortBy && filters.sortBy !== "date") count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();
  const selectedCommunity = communities.find(c => c.community_id === filters.communityId);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter toggle and active filters */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          disabled={disabled}
          className="relative"
        >
          <SlidersHorizontal className="h-4 w-4 mr-2" />
          Filters
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            disabled={disabled}
          >
            Clear All
          </Button>
        )}
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.sortBy && filters.sortBy !== "date" && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Sort: {filters.sortBy}
              <button
                onClick={() => handleSortChange("date")}
                disabled={disabled}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {selectedCommunity && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Community: {selectedCommunity.name}
              <button
                onClick={clearCommunityFilter}
                disabled={disabled}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {filters.dateRange && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Date: {format(filters.dateRange.from, "MMM d")} - {format(filters.dateRange.to, "MMM d")}
              <button
                onClick={clearDateRange}
                disabled={disabled}
                className="ml-1 hover:bg-muted-foreground/20 rounded-sm p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-input rounded-md bg-muted/50">
          {/* Sort by */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Sort by</label>
            <Select
              value={filters.sortBy || "date"}
              onValueChange={handleSortChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Most Recent</SelectItem>
                <SelectItem value="likes">Most Liked</SelectItem>
                <SelectItem value="comments">Most Commented</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Community filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Community</label>
            <Select
              value={filters.communityId || "all"}
              onValueChange={handleCommunityChange}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder="All communities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Communities</SelectItem>
                {communities.map((community) => (
                  <SelectItem key={community.community_id} value={community.community_id}>
                    {community.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.dateRange?.from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.from ? (
                      format(filters.dateRange.from, "MMM d")
                    ) : (
                      "From"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.from}
                    onSelect={handleDateFromChange}
                    disabled={(date) => {
                      const today = new Date();
                      const isAfterToday = date > today;
                      const isAfterToDate = filters.dateRange?.to ? date > filters.dateRange.to : false;
                      return isAfterToday || isAfterToDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !filters.dateRange?.to && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateRange?.to ? (
                      format(filters.dateRange.to, "MMM d")
                    ) : (
                      "To"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.dateRange?.to}
                    onSelect={handleDateToChange}
                    disabled={(date) => {
                      const today = new Date();
                      const isAfterToday = date > today;
                      const isBeforeFromDate = filters.dateRange?.from ? date < filters.dateRange.from : false;
                      return isAfterToday || isBeforeFromDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}