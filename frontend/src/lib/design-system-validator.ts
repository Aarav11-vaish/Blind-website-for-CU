/**
 * Design System Validation Utility
 *
 * This utility validates that components are using design system tokens correctly
 * and provides suggestions for improvements.
 */

import { designTokens } from "./design-system";

interface ValidationResult {
  isCompliant: boolean;
  violations: string[];
  suggestions: string[];
  score: number; // 0-100
}

interface ComponentAnalysis {
  componentName: string;
  filePath: string;
  validation: ValidationResult;
  recommendations: string[];
}

/**
 * Validates a component's className string against design system standards
 */
export function validateComponentClasses(
  className: string,
  componentName: string = "Unknown"
): ValidationResult {
  const violations: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Check for hardcoded colors
  const hardcodedColorPattern =
    /(bg-|text-|border-)(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g;
  const hardcodedColors = className.match(hardcodedColorPattern);

  if (hardcodedColors) {
    violations.push(`Uses hardcoded colors: ${hardcodedColors.join(", ")}`);
    suggestions.push(
      "Replace with design system color tokens (designTokens.background, designTokens.text, etc.)"
    );
    score -= 20;
  }

  // Check for missing transitions on interactive elements
  const hasInteractiveClasses = /hover:|focus:|active:|cursor-pointer/.test(
    className
  );
  const hasTransition = /transition-/.test(className);

  if (hasInteractiveClasses && !hasTransition) {
    violations.push("Interactive element missing transition");
    suggestions.push(
      "Add designTokens.transition.default for smooth interactions"
    );
    score -= 15;
  }

  // Check for missing focus states on interactive elements
  const hasClickHandler = /cursor-pointer|button/.test(className);
  const hasFocusState = /focus:/.test(className);

  if (hasClickHandler && !hasFocusState) {
    violations.push("Interactive element missing focus state");
    suggestions.push("Add designTokens.focus.ring for accessibility");
    score -= 15;
  }

  // Check for missing touch targets
  const hasButton = /button|cursor-pointer/.test(className);
  const hasTouchTarget = /min-h-\[44px\]|touch-manipulation/.test(className);

  if (hasButton && !hasTouchTarget) {
    violations.push("Interactive element missing proper touch targets");
    suggestions.push(
      "Add designTokens.accessibility.touchTarget for mobile accessibility"
    );
    score -= 10;
  }

  // Check for inconsistent spacing
  const spacingPattern = /(p|m|space)-(x|y|t|b|l|r)?-\d+/g;
  const spacingClasses = className.match(spacingPattern);

  if (spacingClasses && spacingClasses.length > 3) {
    violations.push("Inconsistent spacing classes detected");
    suggestions.push(
      "Consider using designTokens.spacing utilities for consistent spacing"
    );
    score -= 5;
  }

  // Check for animations without motion-safe wrapper
  const hasAnimation = /animate-|transition-transform/.test(className);
  const hasMotionSafe = /motion-reduce:/.test(className);

  if (hasAnimation && !hasMotionSafe) {
    violations.push("Animation without motion preference consideration");
    suggestions.push(
      "Wrap animations with motionSafe() utility to respect user preferences"
    );
    score -= 10;
  }

  // Check for proper semantic color usage
  const hasSemanticColors = /text-primary|bg-card|border-border/.test(
    className
  );
  const hasDirectColors = /text-foreground|bg-background/.test(className);

  if (hasDirectColors && !hasSemanticColors) {
    suggestions.push(
      "Consider using semantic color tokens for better theme consistency"
    );
    score -= 5;
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    suggestions,
    score: Math.max(0, score),
  };
}

/**
 * Analyzes a component file for design system compliance
 */
export function analyzeComponentFile(
  fileContent: string,
  filePath: string
): ComponentAnalysis {
  const componentName =
    filePath.split("/").pop()?.replace(".tsx", "") || "Unknown";

  // Extract className strings from the file
  const classNamePattern =
    /className\s*=\s*{?[`"']([^`"']*)[`"']|className\s*=\s*{([^}]*)}/g;
  const classNames: string[] = [];
  let match;

  while ((match = classNamePattern.exec(fileContent)) !== null) {
    if (match[1]) {
      classNames.push(match[1]);
    } else if (match[2]) {
      // Handle template literals and expressions
      classNames.push(match[2]);
    }
  }

  // Validate all className strings
  const allViolations: string[] = [];
  const allSuggestions: string[] = [];
  let totalScore = 0;
  let classCount = 0;

  classNames.forEach((className, index) => {
    const validation = validateComponentClasses(
      className,
      `${componentName}[${index}]`
    );
    allViolations.push(...validation.violations);
    allSuggestions.push(...validation.suggestions);
    totalScore += validation.score;
    classCount++;
  });

  const averageScore = classCount > 0 ? totalScore / classCount : 100;

  // Generate component-specific recommendations
  const recommendations: string[] = [];

  if (allViolations.length > 0) {
    recommendations.push(
      "Update component to use design system tokens consistently"
    );
  }

  if (allViolations.some((v) => v.includes("transition"))) {
    recommendations.push("Add smooth transitions to all interactive elements");
  }

  if (allViolations.some((v) => v.includes("focus"))) {
    recommendations.push("Implement proper focus management for accessibility");
  }

  if (allViolations.some((v) => v.includes("motion"))) {
    recommendations.push("Wrap animations with motion-safe utilities");
  }

  return {
    componentName,
    filePath,
    validation: {
      isCompliant: allViolations.length === 0,
      violations: [...new Set(allViolations)], // Remove duplicates
      suggestions: [...new Set(allSuggestions)], // Remove duplicates
      score: Math.round(averageScore),
    },
    recommendations,
  };
}

/**
 * Generates a compliance report for multiple components
 */
export function generateComplianceReport(analyses: ComponentAnalysis[]): {
  overallScore: number;
  compliantComponents: number;
  totalComponents: number;
  commonViolations: { violation: string; count: number }[];
  recommendations: string[];
} {
  const totalComponents = analyses.length;
  const compliantComponents = analyses.filter(
    (a) => a.validation.isCompliant
  ).length;
  const overallScore =
    analyses.reduce((sum, a) => sum + a.validation.score, 0) / totalComponents;

  // Count common violations
  const violationCounts = new Map<string, number>();
  analyses.forEach((analysis) => {
    analysis.validation.violations.forEach((violation) => {
      violationCounts.set(violation, (violationCounts.get(violation) || 0) + 1);
    });
  });

  const commonViolations = Array.from(violationCounts.entries())
    .map(([violation, count]) => ({ violation, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 most common violations

  // Generate overall recommendations
  const recommendations: string[] = [];

  if (overallScore < 80) {
    recommendations.push(
      "Implement comprehensive design system token usage across all components"
    );
  }

  if (commonViolations.some((v) => v.violation.includes("hardcoded"))) {
    recommendations.push(
      "Replace all hardcoded colors with design system tokens"
    );
  }

  if (commonViolations.some((v) => v.violation.includes("transition"))) {
    recommendations.push(
      "Add consistent transitions to all interactive elements"
    );
  }

  if (commonViolations.some((v) => v.violation.includes("focus"))) {
    recommendations.push(
      "Implement comprehensive accessibility focus management"
    );
  }

  return {
    overallScore: Math.round(overallScore),
    compliantComponents,
    totalComponents,
    commonViolations,
    recommendations,
  };
}

/**
 * Utility to check if a component is using the new design system
 */
export function isUsingDesignSystem(fileContent: string): boolean {
  return (
    fileContent.includes("designTokens") ||
    fileContent.includes("motionSafe") ||
    fileContent.includes("componentPatterns")
  );
}

/**
 * Suggests design system improvements for a component
 */
export function suggestImprovements(analysis: ComponentAnalysis): string[] {
  const improvements: string[] = [];

  if (analysis.validation.score < 60) {
    improvements.push(
      "🔴 Critical: Component needs major design system refactoring"
    );
  } else if (analysis.validation.score < 80) {
    improvements.push("🟡 Warning: Component needs design system improvements");
  } else {
    improvements.push("🟢 Good: Component follows design system well");
  }

  analysis.validation.violations.forEach((violation) => {
    if (violation.includes("hardcoded")) {
      improvements.push(
        "• Replace hardcoded colors with designTokens.background/text/border"
      );
    }
    if (violation.includes("transition")) {
      improvements.push(
        "• Add designTokens.transition.default to interactive elements"
      );
    }
    if (violation.includes("focus")) {
      improvements.push("• Add designTokens.focus.ring for accessibility");
    }
    if (violation.includes("touch")) {
      improvements.push(
        "• Add designTokens.accessibility.touchTarget for mobile"
      );
    }
    if (violation.includes("motion")) {
      improvements.push("• Wrap animations with motionSafe() utility");
    }
  });

  return improvements;
}
