"use client";

import React, { useRef, useEffect, useState } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { SearchSuggestion } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  showSuggestions?: boolean;
  suggestionsLoading?: boolean;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  onSuggestionsHide?: () => void;
  disabled?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Search posts, users, communities...",
  suggestions = [],
  showSuggestions = false,
  suggestionsLoading = false,
  onSuggestionSelect,
  onSuggestionsHide,
  disabled = false,
  className,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to hide suggestions
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onSuggestionsHide?.();
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSuggestionsHide]);

  // Reset selected suggestion when suggestions change
  useEffect(() => {
    // Use a callback to avoid direct setState in effect
    setTimeout(() => setSelectedSuggestionIndex(-1), 0);
  }, [suggestions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setSelectedSuggestionIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === "Enter") {
        onSearch?.();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedSuggestionIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < suggestions.length) {
          onSuggestionSelect?.(suggestions[selectedSuggestionIndex]);
        } else {
          onSearch?.();
        }
        break;
      case "Escape":
        onSuggestionsHide?.();
        inputRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    onSuggestionSelect?.(suggestion);
  };

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  const getSuggestionIcon = (type: SearchSuggestion["type"]) => {
    switch (type) {
      case "user":
        return "👤";
      case "community":
        return "👥";
      case "content":
      default:
        return "📝";
    }
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            "w-full pl-10 pr-10 py-2 border border-input bg-background rounded-md",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "text-sm"
          )}
        />
        {value && (
          <button
            onClick={handleClear}
            disabled={disabled}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-muted rounded-sm transition-colors"
            aria-label="Clear search"
          >
            <X className="h-3 w-3 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && isFocused && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
          {suggestionsLoading && (
            <div className="flex items-center justify-center py-3">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading suggestions...</span>
            </div>
          )}

          {!suggestionsLoading && suggestions.length === 0 && value.trim() && (
            <div className="py-3 px-4 text-sm text-muted-foreground text-center">
              No suggestions found
            </div>
          )}

          {!suggestionsLoading && suggestions.length > 0 && (
            <ul className="py-1">
              {suggestions.map((suggestion, index) => (
                <li key={`${suggestion.type}-${suggestion.text}-${index}`}>
                  <button
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors",
                      "flex items-center space-x-3",
                      selectedSuggestionIndex === index && "bg-muted"
                    )}
                  >
                    <span className="text-base">{getSuggestionIcon(suggestion.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{suggestion.text}</div>
                      {suggestion.count !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.count} result{suggestion.count !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground capitalize">
                      {suggestion.type}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}