/**
 * Design System Compliance Utilities
 *
 * This module provides utilities to ensure consistent usage of design tokens
 * and animations across all components in the BlindCU dashboard.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Enhanced cn utility that ensures design system compliance
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Design system color tokens - ensures consistent usage across components
 */
export const designTokens = {
  // Background colors
  background: {
    light: "bg-background",
    dark: "bg-background",
    primary: "bg-primary",
    card: "bg-card",
    muted: "bg-muted",
    accent: "bg-accent",
    destructive: "bg-destructive",
  },

  // Text colors
  text: {
    primary: "text-foreground",
    muted: "text-muted-foreground",
    accent: "text-accent-foreground",
    destructive: "text-destructive-foreground",
    onPrimary: "text-primary-foreground",
    brand: "text-primary",
  },

  // Border colors
  border: {
    default: "border-border",
    primary: "border-primary",
    muted: "border-muted",
  },

  // Interactive states
  hover: {
    background: "hover:bg-accent",
    text: "hover:text-primary",
    border: "hover:border-primary/50",
    scale: "hover:scale-105",
    shadow: "hover:shadow-md",
  },

  // Focus states
  focus: {
    ring: "focus:ring-2 focus:ring-primary focus:ring-offset-2",
    outline: "focus:outline-none",
    visible:
      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  },

  // Transitions and animations
  transition: {
    default: "transition-colors duration-200",
    all: "transition-all duration-200",
    fast: "transition-all duration-150",
    slow: "transition-all duration-300",
    transform: "transition-transform duration-200",
  },

  // Motion-safe animations (respects prefers-reduced-motion)
  animation: {
    fadeIn: "animate-in fade-in duration-200",
    slideIn: "animate-in slide-in-from-bottom-4 duration-200",
    scaleIn: "animate-in zoom-in-95 duration-200",
    pulse: "animate-pulse",
    spin: "animate-spin",
    bounce: "animate-bounce",
  },

  // Accessibility
  accessibility: {
    touchTarget: "min-h-[44px] min-w-[44px]",
    touchManipulation: "touch-manipulation",
    screenReader: "sr-only",
    focusVisible:
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
  },

  // Spacing
  spacing: {
    xs: "space-x-1 space-y-1",
    sm: "space-x-2 space-y-2",
    md: "space-x-3 space-y-3",
    lg: "space-x-4 space-y-4",
    xl: "space-x-6 space-y-6",
  },

  // Shadows
  shadow: {
    sm: "shadow-sm",
    default: "shadow",
    md: "shadow-md",
    lg: "shadow-lg",
    xl: "shadow-xl",
  },
} as const;

/**
 * Interactive element base classes - ensures consistent behavior
 */
export const interactiveClasses = cn(
  designTokens.transition.default,
  designTokens.focus.outline,
  designTokens.focus.ring,
  designTokens.accessibility.touchManipulation,
  designTokens.accessibility.touchTarget
);

/**
 * Button variant classes using design tokens
 */
export const buttonVariants = {
  primary: cn(
    designTokens.background.primary,
    designTokens.text.onPrimary,
    "hover:bg-primary-hover",
    designTokens.transition.default,
    designTokens.focus.ring
  ),
  secondary: cn(
    designTokens.background.muted,
    designTokens.text.primary,
    designTokens.hover.background,
    designTokens.transition.default,
    designTokens.focus.ring
  ),
  outline: cn(
    "border",
    designTokens.border.default,
    designTokens.text.primary,
    designTokens.hover.background,
    "hover:border-primary/50",
    designTokens.transition.default,
    designTokens.focus.ring
  ),
  ghost: cn(
    designTokens.text.primary,
    designTokens.hover.background,
    designTokens.transition.default,
    designTokens.focus.ring
  ),
} as const;

/**
 * Card classes using design tokens
 */
export const cardClasses = cn(
  designTokens.background.card,
  "border",
  designTokens.border.default,
  "rounded-lg",
  designTokens.shadow.sm,
  designTokens.transition.all,
  designTokens.hover.shadow
);

/**
 * Input classes using design tokens
 */
export const inputClasses = cn(
  designTokens.background.card,
  "border",
  designTokens.border.default,
  designTokens.text.primary,
  "placeholder:text-muted-foreground-light dark:placeholder:text-muted-foreground-dark",
  "rounded-md px-3 py-2",
  designTokens.transition.default,
  "focus:border-primary",
  designTokens.focus.ring
);

/**
 * Navigation link classes using design tokens
 */
export const navLinkClasses = {
  base: cn(
    "flex items-center space-x-3 px-4 py-3 rounded-md",
    designTokens.transition.default,
    designTokens.focus.ring,
    designTokens.accessibility.touchTarget
  ),
  active: cn("bg-primary/20 text-primary font-semibold"),
  inactive: cn(
    designTokens.text.muted,
    designTokens.hover.background,
    designTokens.hover.text
  ),
} as const;

/**
 * Utility to create motion-safe animations
 * Respects user's motion preferences
 */
export function motionSafe(animation: string) {
  return cn(
    animation,
    "motion-reduce:animate-none motion-reduce:transition-none"
  );
}

/**
 * Utility to create responsive classes
 */
export function responsive(classes: {
  base?: string;
  sm?: string;
  md?: string;
  lg?: string;
  xl?: string;
}) {
  return cn(
    classes.base,
    classes.sm && `sm:${classes.sm}`,
    classes.md && `md:${classes.md}`,
    classes.lg && `lg:${classes.lg}`,
    classes.xl && `xl:${classes.xl}`
  );
}

/**
 * Utility to ensure proper contrast ratios
 */
export function contrastSafe(baseClass: string, highContrastClass?: string) {
  return cn(
    baseClass,
    highContrastClass && `contrast-more:${highContrastClass}`
  );
}

/**
 * Theme-aware classes that automatically switch between light and dark
 */
export function themeAware(lightClass: string, darkClass: string) {
  return cn(lightClass, `dark:${darkClass}`);
}

/**
 * Validation function to check if a component uses design system tokens
 */
export function validateDesignSystemUsage(className: string): {
  isCompliant: boolean;
  violations: string[];
  suggestions: string[];
} {
  const violations: string[] = [];
  const suggestions: string[] = [];

  // Check for hardcoded colors
  const hardcodedColorPattern =
    /(bg-|text-|border-)(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g;
  const hardcodedColors = className.match(hardcodedColorPattern);

  if (hardcodedColors) {
    violations.push("Uses hardcoded colors instead of design tokens");
    suggestions.push(
      "Use designTokens.background, designTokens.text, or designTokens.border instead"
    );
  }

  // Check for missing transitions on interactive elements
  const hasInteractiveClasses = /hover:|focus:|active:/.test(className);
  const hasTransition = /transition-/.test(className);

  if (hasInteractiveClasses && !hasTransition) {
    violations.push("Interactive element missing transition");
    suggestions.push(
      "Add designTokens.transition.default for smooth interactions"
    );
  }

  // Check for missing focus states on interactive elements
  const hasClickHandler = /cursor-pointer|button|link/.test(className);
  const hasFocusState = /focus:/.test(className);

  if (hasClickHandler && !hasFocusState) {
    violations.push("Interactive element missing focus state");
    suggestions.push("Add designTokens.focus.ring for accessibility");
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    suggestions,
  };
}

/**
 * Pre-built component class combinations for common patterns
 */
export const componentPatterns = {
  // Interactive button pattern
  interactiveButton: cn(
    interactiveClasses,
    "rounded-md px-4 py-2",
    designTokens.hover.background,
    designTokens.hover.text
  ),

  // Card pattern
  card: cn(cardClasses, "p-6", "cursor-pointer", designTokens.focus.visible),

  // Input field pattern
  input: cn(inputClasses, designTokens.accessibility.touchTarget),

  // Navigation item pattern
  navItem: cn(navLinkClasses.base, navLinkClasses.inactive),

  // Active navigation item pattern
  activeNavItem: cn(navLinkClasses.base, navLinkClasses.active),

  // Loading state pattern
  loading: cn("animate-pulse", designTokens.background.muted, "rounded"),

  // Error state pattern
  error: cn(
    designTokens.background.destructive,
    designTokens.text.destructive,
    "border border-destructive/20",
    "rounded-md p-3"
  ),
} as const;
