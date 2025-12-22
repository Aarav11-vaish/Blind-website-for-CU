#!/usr/bin/env node

/**
 * Design System Validation Script
 * 
 * This script analyzes all React components in the project and generates
 * a compliance report for design system usage.
 */

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');

// Simple validation functions (Node.js compatible versions)
function validateComponentClasses(className, componentName = "Unknown") {
  const violations = [];
  const suggestions = [];
  let score = 100;

  // Check for hardcoded colors
  const hardcodedColorPattern = /(bg-|text-|border-)(red|blue|green|yellow|purple|pink|indigo|gray|slate|zinc|neutral|stone|orange|amber|lime|emerald|teal|cyan|sky|violet|fuchsia|rose)-\d+/g;
  const hardcodedColors = className.match(hardcodedColorPattern);
  
  if (hardcodedColors) {
    violations.push(`Uses hardcoded colors: ${hardcodedColors.join(', ')}`);
    suggestions.push("Replace with design system color tokens");
    score -= 20;
  }

  // Check for missing transitions on interactive elements
  const hasInteractiveClasses = /hover:|focus:|active:|cursor-pointer/.test(className);
  const hasTransition = /transition-/.test(className);
  
  if (hasInteractiveClasses && !hasTransition) {
    violations.push("Interactive element missing transition");
    suggestions.push("Add transition classes for smooth interactions");
    score -= 15;
  }

  // Check for missing focus states
  const hasClickHandler = /cursor-pointer|button/.test(className);
  const hasFocusState = /focus:/.test(className);
  
  if (hasClickHandler && !hasFocusState) {
    violations.push("Interactive element missing focus state");
    suggestions.push("Add focus states for accessibility");
    score -= 15;
  }

  // Check for animations without motion consideration
  const hasAnimation = /animate-|transition-transform/.test(className);
  const hasMotionSafe = /motion-reduce:/.test(className);
  
  if (hasAnimation && !hasMotionSafe) {
    violations.push("Animation without motion preference consideration");
    suggestions.push("Consider user motion preferences");
    score -= 10;
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    suggestions,
    score: Math.max(0, score)
  };
}

function analyzeComponentFile(fileContent, filePath) {
  const componentName = path.basename(filePath, '.tsx');
  
  // Extract className strings
  const classNamePattern = /className\s*=\s*{?[`"']([^`"']*)[`"']|className\s*=\s*{([^}]*)}/g;
  const classNames = [];
  let match;
  
  while ((match = classNamePattern.exec(fileContent)) !== null) {
    if (match[1]) {
      classNames.push(match[1]);
    } else if (match[2]) {
      classNames.push(match[2]);
    }
  }

  // Validate all className strings
  const allViolations = [];
  const allSuggestions = [];
  let totalScore = 0;
  let classCount = 0;

  classNames.forEach((className, index) => {
    const validation = validateComponentClasses(className, `${componentName}[${index}]`);
    allViolations.push(...validation.violations);
    allSuggestions.push(...validation.suggestions);
    totalScore += validation.score;
    classCount++;
  });

  const averageScore = classCount > 0 ? totalScore / classCount : 100;

  // Check if using design system
  const usingDesignSystem = fileContent.includes('designTokens') || 
                           fileContent.includes('motionSafe') ||
                           fileContent.includes('componentPatterns');

  return {
    componentName,
    filePath,
    usingDesignSystem,
    validation: {
      isCompliant: allViolations.length === 0,
      violations: [...new Set(allViolations)],
      suggestions: [...new Set(allSuggestions)],
      score: Math.round(averageScore)
    }
  };
}

async function main() {
  console.log('🔍 Analyzing design system compliance...\n');

  // Find all React component files
  const componentFiles = await glob('src/components/**/*.{tsx,ts}', {
    ignore: ['**/__tests__/**', '**/*.test.*', '**/*.spec.*']
  });

  const analyses = [];

  for (const filePath of componentFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf8');
      const analysis = analyzeComponentFile(fileContent, filePath);
      analyses.push(analysis);
    } catch (error) {
      console.error(`❌ Error analyzing ${filePath}:`, error.message);
    }
  }

  // Generate report
  const totalComponents = analyses.length;
  const compliantComponents = analyses.filter(a => a.validation.isCompliant).length;
  const usingDesignSystem = analyses.filter(a => a.usingDesignSystem).length;
  const overallScore = analyses.reduce((sum, a) => sum + a.validation.score, 0) / totalComponents;

  // Count common violations
  const violationCounts = new Map();
  analyses.forEach(analysis => {
    analysis.validation.violations.forEach(violation => {
      violationCounts.set(violation, (violationCounts.get(violation) || 0) + 1);
    });
  });

  const commonViolations = Array.from(violationCounts.entries())
    .map(([violation, count]) => ({ violation, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Print report
  console.log('📊 DESIGN SYSTEM COMPLIANCE REPORT');
  console.log('=====================================\n');
  
  console.log(`📈 Overall Score: ${Math.round(overallScore)}/100`);
  console.log(`✅ Compliant Components: ${compliantComponents}/${totalComponents} (${Math.round(compliantComponents/totalComponents*100)}%)`);
  console.log(`🎨 Using Design System: ${usingDesignSystem}/${totalComponents} (${Math.round(usingDesignSystem/totalComponents*100)}%)\n`);

  if (commonViolations.length > 0) {
    console.log('🚨 COMMON VIOLATIONS:');
    commonViolations.forEach(({ violation, count }, index) => {
      console.log(`${index + 1}. ${violation} (${count} components)`);
    });
    console.log('');
  }

  // Show component details
  console.log('📋 COMPONENT DETAILS:');
  console.log('====================\n');

  analyses
    .sort((a, b) => a.validation.score - b.validation.score)
    .forEach(analysis => {
      const { componentName, validation, usingDesignSystem } = analysis;
      const scoreEmoji = validation.score >= 80 ? '🟢' : validation.score >= 60 ? '🟡' : '🔴';
      const dsEmoji = usingDesignSystem ? '🎨' : '⚪';
      
      console.log(`${scoreEmoji} ${dsEmoji} ${componentName} (${validation.score}/100)`);
      
      if (validation.violations.length > 0) {
        validation.violations.forEach(violation => {
          console.log(`   ❌ ${violation}`);
        });
      }
      
      if (validation.suggestions.length > 0) {
        validation.suggestions.slice(0, 2).forEach(suggestion => {
          console.log(`   💡 ${suggestion}`);
        });
      }
      
      console.log('');
    });

  // Recommendations
  console.log('🎯 RECOMMENDATIONS:');
  console.log('==================\n');

  if (overallScore < 80) {
    console.log('1. 🔧 Implement comprehensive design system token usage');
  }
  
  if (usingDesignSystem < totalComponents * 0.8) {
    console.log('2. 📦 Migrate remaining components to use design system utilities');
  }
  
  if (commonViolations.some(v => v.violation.includes('hardcoded'))) {
    console.log('3. 🎨 Replace all hardcoded colors with design tokens');
  }
  
  if (commonViolations.some(v => v.violation.includes('transition'))) {
    console.log('4. ⚡ Add consistent transitions to interactive elements');
  }
  
  if (commonViolations.some(v => v.violation.includes('focus'))) {
    console.log('5. ♿ Implement comprehensive accessibility focus management');
  }

  console.log('\n✨ Design system compliance analysis complete!');
  
  // Exit with error code if compliance is low
  if (overallScore < 70) {
    process.exit(1);
  }
}

main().catch(console.error);