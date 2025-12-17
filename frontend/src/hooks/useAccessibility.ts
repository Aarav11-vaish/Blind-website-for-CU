import { useEffect, useState, useCallback } from "react";
import {
  FocusManager,
  ScreenReaderAnnouncer,
  MotionPreferences,
  ColorAccessibility,
} from "@/lib/accessibility";

/**
 * Hook for managing accessibility features
 */
export function useAccessibility() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersDarkMode, setPrefersDarkMode] = useState(false);
  const [prefersHighContrast, setPrefersHighContrast] = useState(false);

  useEffect(() => {
    // Initialize preferences
    setPrefersReducedMotion(MotionPreferences.prefersReducedMotion());
    setPrefersDarkMode(ColorAccessibility.prefersDarkMode());
    setPrefersHighContrast(ColorAccessibility.prefersHighContrast());

    // Listen for changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");

    const handleReducedMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    const handleDarkModeChange = (e: MediaQueryListEvent) =>
      setPrefersDarkMode(e.matches);
    const handleHighContrastChange = (e: MediaQueryListEvent) =>
      setPrefersHighContrast(e.matches);

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    darkModeQuery.addEventListener("change", handleDarkModeChange);
    highContrastQuery.addEventListener("change", handleHighContrastChange);

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange
      );
      darkModeQuery.removeEventListener("change", handleDarkModeChange);
      highContrastQuery.removeEventListener("change", handleHighContrastChange);
    };
  }, []);

  const announceToScreenReader = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      ScreenReaderAnnouncer.getInstance().announce(message, priority);
    },
    []
  );

  const trapFocus = useCallback(
    (container: HTMLElement, event: KeyboardEvent) => {
      FocusManager.trapFocus(container, event);
    },
    []
  );

  const moveFocus = useCallback(
    (direction: "next" | "previous", container?: HTMLElement) => {
      FocusManager.moveFocus(direction, container);
    },
    []
  );

  return {
    prefersReducedMotion,
    prefersDarkMode,
    prefersHighContrast,
    announceToScreenReader,
    trapFocus,
    moveFocus,
  };
}

/**
 * Hook for keyboard navigation in lists
 */
export function useKeyboardNavigation(
  items: HTMLElement[],
  onSelect?: (index: number) => void
) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
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
          return;
      }

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        items[newIndex]?.focus();
      }
    },
    [currentIndex, items, onSelect]
  );

  return {
    currentIndex,
    setCurrentIndex,
    handleKeyDown,
  };
}

/**
 * Hook for managing focus trap in modals/overlays
 */
export function useFocusTrap(isActive: boolean) {
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isActive || !containerRef) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        FocusManager.trapFocus(containerRef, event);
      }
    };

    // Focus first element when trap becomes active
    const focusableElements = FocusManager.getFocusableElements(containerRef);
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isActive, containerRef]);

  return setContainerRef;
}

/**
 * Hook for announcing route changes to screen readers
 */
export function useRouteAnnouncement() {
  const announceRouteChange = useCallback((routeName: string) => {
    ScreenReaderAnnouncer.getInstance().announce(
      `Navigated to ${routeName}`,
      "polite"
    );
  }, []);

  return { announceRouteChange };
}

/**
 * Hook for managing live regions for dynamic content updates
 */
export function useLiveRegion() {
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = useCallback(
    (newMessage: string, newPriority: "polite" | "assertive" = "polite") => {
      setMessage(newMessage);
      setPriority(newPriority);

      // Clear message after announcement
      setTimeout(() => setMessage(""), 1000);
    },
    []
  );

  return {
    message,
    priority,
    announce,
  };
}
