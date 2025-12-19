/**
 * **Feature: blindcu-dashboard, Mobile Responsiveness Test**
 * 
 * This test verifies mobile responsiveness and touch interactions
 * across different viewport sizes and device types.
 * 
 * **Validates: Requirements 5.1, 5.2**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Posts from '@/components/dashboard/Posts';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock API functions
jest.mock('@/lib/api', () => ({
  getGlobalPosts: jest.fn(() => Promise.resolve({ posts: [] })),
}));

// Mock hooks
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: true,
    isLoading: false,
    user: { email: 'test@example.com', user_id: 'user123', isverified: true },
    redirectToSignin: jest.fn(),
  })),
}));

describe('Mobile Responsiveness Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === 'token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          email: 'test@example.com',
          user_id: 'user123',
          isverified: true,
        });
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  const setViewportSize = (width: number, height: number = 800) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: height,
    });
  };

  describe('Viewport Adaptations', () => {
    it('adapts layout for desktop viewport (≥768px)', async () => {
      setViewportSize(1024);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Desktop should show full sidebar
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).not.toHaveClass('hidden');

      // Mobile menu toggle should be hidden on desktop
      const menuToggle = screen.queryByLabelText(/toggle navigation menu/i);
      expect(menuToggle).toBeInTheDocument(); // Present but hidden via CSS
    });

    it('adapts layout for tablet viewport (640px-767px)', async () => {
      setViewportSize(700);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Should still show sidebar but may be collapsible
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).toBeInTheDocument();
    });

    it('adapts layout for mobile viewport (<640px)', async () => {
      setViewportSize(375);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Mobile should have collapsed sidebar initially
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).toHaveClass('hidden');

      // Mobile menu toggle should be visible
      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
      expect(menuToggle).toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    it('toggles mobile sidebar correctly', async () => {
      setViewportSize(375);
      const user = userEvent.setup();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });

      // Initially collapsed
      expect(sidebar).toHaveClass('hidden');

      // Toggle to open
      await act(async () => {
        await user.click(menuToggle);
      });

      // Should be visible now
      expect(sidebar).not.toHaveClass('hidden');
    });

    it('closes mobile sidebar when clicking overlay', async () => {
      setViewportSize(375);
      const user = userEvent.setup();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);

      // Open sidebar
      await act(async () => {
        await user.click(menuToggle);
      });

      // Find and click overlay (if present)
      const overlay = document.querySelector('[aria-hidden="true"]');
      if (overlay) {
        await act(async () => {
          fireEvent.click(overlay);
        });

        // Sidebar should be closed
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar).toHaveClass('hidden');
      }
    });

    it('handles keyboard navigation on mobile', async () => {
      setViewportSize(375);
      const user = userEvent.setup();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);

      // Open sidebar with keyboard
      await act(async () => {
        await user.click(menuToggle);
      });

      // Test Escape key to close
      await act(async () => {
        await user.keyboard('{Escape}');
      });

      // Sidebar should be closed
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).toHaveClass('hidden');
    });
  });

  describe('Touch Interactions', () => {
    it('provides appropriate touch targets', async () => {
      setViewportSize(375);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Menu toggle should have appropriate touch target size
      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
      expect(menuToggle).toHaveClass('min-h-[44px]', 'min-w-[44px]');

      // Navigation links should have touch-friendly sizing
      const allPostsLink = screen.getByText('All Posts');
      const linkElement = allPostsLink.closest('a');
      expect(linkElement).toHaveClass('min-h-[44px]');
    });

    it('handles touch events properly', async () => {
      setViewportSize(375);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);

      // Simulate touch events
      await act(async () => {
        fireEvent.touchStart(menuToggle);
        fireEvent.touchEnd(menuToggle);
        fireEvent.click(menuToggle);
      });

      // Sidebar should open
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).not.toHaveClass('hidden');
    });
  });

  describe('Content Adaptation', () => {
    it('adapts content layout for mobile', async () => {
      setViewportSize(375);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Main content should take full width on mobile
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveClass('col-span-12');
    });

    it('maintains readability on small screens', async () => {
      setViewportSize(320); // Very small mobile screen

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Text should remain readable
      const heading = screen.getByText('BlindCU');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass('text-3xl');
    });
  });

  describe('Responsive Breakpoints', () => {
    const testBreakpoints = [
      { width: 320, name: 'Small Mobile' },
      { width: 375, name: 'Mobile' },
      { width: 640, name: 'Large Mobile' },
      { width: 768, name: 'Tablet' },
      { width: 1024, name: 'Desktop' },
      { width: 1280, name: 'Large Desktop' },
    ];

    testBreakpoints.forEach(({ width, name }) => {
      it(`handles ${name} viewport (${width}px) correctly`, async () => {
        setViewportSize(width);

        await act(async () => {
          render(
            <DashboardLayout>
              <Posts />
            </DashboardLayout>
          );
        });

        // Basic layout should render without errors
        expect(screen.getByRole('banner')).toBeInTheDocument();
        expect(screen.getByRole('main')).toBeInTheDocument();
        expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();

        // Mobile-specific elements
        if (width < 768) {
          const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
          expect(menuToggle).toBeInTheDocument();
        }
      });
    });
  });

  describe('Orientation Changes', () => {
    it('handles portrait to landscape orientation change', async () => {
      // Start in portrait
      setViewportSize(375, 667);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Change to landscape
      setViewportSize(667, 375);

      // Trigger resize event
      await act(async () => {
        fireEvent(window, new Event('resize'));
      });

      // Layout should adapt
      expect(screen.getByRole('main')).toBeInTheDocument();
    });
  });

  describe('Accessibility on Mobile', () => {
    it('maintains accessibility features on mobile', async () => {
      setViewportSize(375);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Skip link should still be available
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();

      // ARIA labels should be preserved
      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
      expect(menuToggle).toHaveAttribute('aria-label');

      // Focus management should work
      expect(menuToggle).toHaveAttribute('tabindex', '0');
    });

    it('provides proper focus indicators on mobile', async () => {
      setViewportSize(375);
      const user = userEvent.setup();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);

      // Focus should be visible
      await act(async () => {
        await user.tab();
      });

      expect(menuToggle).toHaveClass('focus-visible:ring-2');
    });
  });
});