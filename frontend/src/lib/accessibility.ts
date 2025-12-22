/**
 * Accessibility utilities for the BlindCU dashboard
 */

/**
 * Manages focus for keyboard navigation
 */
export class FocusManager {
  private static focusableSelectors = [
    "button:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    "a[href]",
    '[tabindex]:not([tabindex="-1"])',
    '[role="button"]:not([disabled])',
    '[role="link"]:not([disabled])',
  ].join(", ");

  /**
   * Get all focusable elements within a container
   */
  static getFocusableElements(container: HTMLElement): HTMLElement[] {
    return Array.from(container.querySelectorAll(this.focusableSelectors));
  }

  /**
   * Trap focus within a container (useful for modals, dropdowns)
   */
  static trapFocus(container: HTMLElement, event: KeyboardEvent): void {
    if (event.key !== "Tab") return;

    const focusableElements = this.getFocusableElements(container);
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Move focus to the next/previous focusable element
   */
  static moveFocus(
    direction: "next" | "previous",
    container?: HTMLElement
  ): void {
    const root = container || document.body;
    const focusableElements = this.getFocusableElements(root);
    const currentIndex = focusableElements.indexOf(
      document.activeElement as HTMLElement
    );

    if (currentIndex === -1) return;

    let nextIndex: number;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % focusableElements.length;
    } else {
      nextIndex =
        currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
    }

    focusableElements[nextIndex]?.focus();
  }
}

/**
 * Announces messages to screen readers
 */
export class ScreenReaderAnnouncer {
  private static instance: ScreenReaderAnnouncer;
  private announcer: HTMLElement;

  private constructor() {
    this.announcer = this.createAnnouncer();
  }

  static getInstance(): ScreenReaderAnnouncer {
    if (!this.instance) {
      this.instance = new ScreenReaderAnnouncer();
    }
    return this.instance;
  }

  private createAnnouncer(): HTMLElement {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.className = "sr-only";
    document.body.appendChild(announcer);
    return announcer;
  }

  /**
   * Announce a message to screen readers
   */
  announce(message: string, priority: "polite" | "assertive" = "polite"): void {
    this.announcer.setAttribute("aria-live", priority);
    this.announcer.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      this.announcer.textContent = "";
    }, 1000);
  }
}

/**
 * Keyboard navigation helpers
 */
export const KeyboardNavigation = {
  /**
   * Handle arrow key navigation for lists
   */
  handleArrowKeys(
    event: KeyboardEvent,
    items: HTMLElement[],
    currentIndex: number,
    onSelect?: (index: number) => void
  ): number {
    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        newIndex = (currentIndex + 1) % items.length;
        break;
      case "ArrowUp":
        event.preventDefault();
        newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
        break;
      case "Home":
        event.preventDefault();
        newIndex = 0;
        break;
      case "End":
        event.preventDefault();
        newIndex = items.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        onSelect?.(currentIndex);
        return currentIndex;
    }

    if (newIndex !== currentIndex) {
      items[newIndex]?.focus();
    }

    return newIndex;
  },

  /**
   * Handle escape key to close overlays
   */
  handleEscape(event: KeyboardEvent, onEscape: () => void): void {
    if (event.key === "Escape") {
      event.preventDefault();
      onEscape();
    }
  },
};

/**
 * Touch interaction helpers for mobile accessibility
 */
export const TouchAccessibility = {
  /**
   * Minimum touch target size (44px x 44px as per WCAG guidelines)
   */
  MIN_TOUCH_TARGET_SIZE: 44,

  /**
   * Check if an element meets minimum touch target requirements
   */
  validateTouchTarget(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.width >= this.MIN_TOUCH_TARGET_SIZE &&
      rect.height >= this.MIN_TOUCH_TARGET_SIZE
    );
  },

  /**
   * Add touch-friendly spacing around small interactive elements
   */
  ensureTouchTarget(element: HTMLElement): void {
    const rect = element.getBoundingClientRect();
    if (
      rect.width < this.MIN_TOUCH_TARGET_SIZE ||
      rect.height < this.MIN_TOUCH_TARGET_SIZE
    ) {
      element.style.minWidth = `${this.MIN_TOUCH_TARGET_SIZE}px`;
      element.style.minHeight = `${this.MIN_TOUCH_TARGET_SIZE}px`;
    }
  },
};

/**
 * Reduced motion preferences
 */
export const MotionPreferences = {
  /**
   * Check if user prefers reduced motion
   */
  prefersReducedMotion(): boolean {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  },

  /**
   * Apply animation only if user doesn't prefer reduced motion
   */
  conditionalAnimation(element: HTMLElement, animationClass: string): void {
    if (!this.prefersReducedMotion()) {
      element.classList.add(animationClass);
    }
  },
};

/**
 * Color contrast and theme helpers
 */
export const ColorAccessibility = {
  /**
   * Check if user prefers dark mode
   */
  prefersDarkMode(): boolean {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  },

  /**
   * Check if user prefers high contrast
   */
  prefersHighContrast(): boolean {
    return window.matchMedia("(prefers-contrast: high)").matches;
  },
};
