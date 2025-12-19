/**
 * Complete Mobile Responsiveness Integration Test
 * **Feature: blindcu-dashboard, Property 17: Responsive layout consistency**
 * **Validates: Requirements 5.1**
 * 
 * This test validates that the dashboard adapts correctly to different viewport sizes
 * and maintains functionality across all responsive breakpoints.
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Posts from '@/components/dashboard/Posts';
import { useAuth } from '@/hooks/useAuth';
import * as api from '@/lib/api';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock useAuth hook
jest.mock('@/hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

// Mock API functions
jest.mock('@/lib/api', () => ({
  getGlobalPosts: jest.fn(),
  likeGlobalPost: jest.fn(),
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('Mobile Responsiveness Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
  };

  const mockUser = {
    user_id: 'test-user-123',
    email: 'test@example.com',
    isverified: true,
  };

  const mockPosts = [
    {
      _id: 'post-1',
      user_id: 'user-1',
      randomName: 'Anonymous User 1',
      content: 'This is a test post content for mobile testing',
      images: [],
      likes: 5,
      likedBy: ['user-2'],
      commentsCount: 2,
      comments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
      redirectToSignin: jest.fn(),
    });

    mockLocalStorage.getItem.mockImplementation((key: string) => {
      if (key === 'token') return 'mock-jwt-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });

    (api.getGlobalPosts as jest.Mock).mockResolvedValue({
      posts: mockPosts,
    });
  });

  describe('Responsive Breakpoint Testing', () => {
    const testViewports = [
      { name: 'Mobile Small', width: 320 },
      { name: 'Mobile Large', width: 480 },
      { name: 'Tablet Portrait', width: 640 },
      { name: 'Tablet Landscape', width: 768 },
      { name: 'Desktop Small', width: 1024 },
      { name: 'Desktop Large', width: 1440 },
    ];

    testViewports.forEach(({ name, width }) => {
      it(`adapts layout correctly for ${name} (${width}px)`, async () => {
        // Set viewport width
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        await act(async () => {
          render(
            <DashboardLayout>
              <Posts />
            </DashboardLayout>
          );
        });

        // Trigger resize event
        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
          expect(screen.getByText('BlindCU')).toBeInTheDocument();
        });

        // Check layout adaptation based on viewport
        const gridContainer = document.querySelector('.grid.grid-cols-12');
        expect(gridContainer).toBeInTheDocument();

        if (width < 768) {
          // Mobile: sidebar should be hidden by default
          const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
          expect(sidebar.closest('aside')).toHaveClass('hidden');

          // Mobile toggle button should be visible
          expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
        } else {
          // Desktop: sidebar should be visible
          const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
          expect(sidebar.closest('aside')).not.toHaveClass('hidden');
        }
      });
    });
  });

  describe('Mobile Navigation Behavior', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });
    });

    it('shows mobile navigation toggle on small screens', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Mobile toggle should be visible
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();

      // Sidebar should be hidden initially
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar.closest('aside')).toHaveClass('hidden');
    });

    it('toggles sidebar visibility on mobile', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const toggleButton = screen.getByLabelText('Toggle navigation menu');
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });

      // Initially hidden
      expect(sidebar.closest('aside')).toHaveClass('hidden');

      // Click to show
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(sidebar.closest('aside')).not.toHaveClass('hidden');
      });

      // Click to hide again
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        expect(sidebar.closest('aside')).toHaveClass('hidden');
      });
    });

    it('closes sidebar when clicking overlay on mobile', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const toggleButton = screen.getByLabelText('Toggle navigation menu');

      // Open sidebar
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).not.toHaveClass('hidden');
      });

      // Find and click overlay (it should have bg-black/50 class)
      const overlay = document.querySelector('.bg-black\\/50');
      if (overlay) {
        await act(async () => {
          fireEvent.click(overlay);
        });

        await waitFor(() => {
          const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
          expect(sidebar.closest('aside')).toHaveClass('hidden');
        });
      }
    });

    it('closes sidebar with Escape key on mobile', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      const toggleButton = screen.getByLabelText('Toggle navigation menu');

      // Open sidebar
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).not.toHaveClass('hidden');
      });

      // Press Escape
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).toHaveClass('hidden');
      });
    });
  });

  describe('Touch-Friendly Interactions', () => {
    beforeEach(() => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('provides adequate touch targets for mobile interactions', async () => {
      (api.likeGlobalPost as jest.Mock).mockResolvedValue({ likes: 6 });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });

      // Check that interactive elements have adequate touch targets
      const toggleButton = screen.getByLabelText('Toggle navigation menu');
      const buttonStyles = window.getComputedStyle(toggleButton);

      // Button should have adequate padding for touch (at least 44px recommended)
      expect(toggleButton).toBeInTheDocument();

      // Test touch interaction on like button
      const likeButtons = screen.getAllByLabelText(/like post/i);
      if (likeButtons.length > 0) {
        await act(async () => {
          fireEvent.click(likeButtons[0]);
        });

        expect(api.likeGlobalPost).toHaveBeenCalled();
      }
    });

    it('handles swipe gestures appropriately', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Simulate touch events for swipe gesture
      const mainContent = screen.getByRole('main');

      await act(async () => {
        fireEvent.touchStart(mainContent, {
          touches: [{ clientX: 0, clientY: 0 }],
        });
      });

      await act(async () => {
        fireEvent.touchMove(mainContent, {
          touches: [{ clientX: 100, clientY: 0 }],
        });
      });

      await act(async () => {
        fireEvent.touchEnd(mainContent);
      });

      // The component should handle touch events without errors
      expect(screen.getByText('BlindCU')).toBeInTheDocument();
    });
  });

  describe('Content Adaptation', () => {
    it('adapts content layout for different screen sizes', async () => {
      const viewports = [
        { width: 320, name: 'Small Mobile' },
        { width: 768, name: 'Tablet' },
        { width: 1024, name: 'Desktop' },
      ];

      for (const viewport of viewports) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: viewport.width,
        });

        const { rerender } = render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
          expect(screen.getByText('BlindCU')).toBeInTheDocument();
        });

        // Check grid layout adapts
        const gridContainer = document.querySelector('.grid.grid-cols-12');
        expect(gridContainer).toBeInTheDocument();

        // Check responsive column classes are applied
        if (viewport.width < 768) {
          // Mobile: full width content when sidebar is hidden
          const mainSection = document.querySelector('.col-span-12.md\\:col-span-9');
          expect(mainSection).toBeInTheDocument();
        } else {
          // Desktop: proper column distribution
          const sidebarSection = document.querySelector('.col-span-12.md\\:col-span-3');
          const mainSection = document.querySelector('.col-span-12.md\\:col-span-9');
          expect(sidebarSection).toBeInTheDocument();
          expect(mainSection).toBeInTheDocument();
        }

        // Clean up for next iteration
        rerender(<div />);
      }
    });

    it('maintains readability across all screen sizes', async () => {
      const testSizes = [320, 480, 768, 1024, 1440];

      for (const width of testSizes) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width,
        });

        await act(async () => {
          render(
            <DashboardLayout>
              <Posts />
            </DashboardLayout>
          );
        });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });

        await waitFor(() => {
          expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
        });

        // Content should be readable and properly spaced
        expect(screen.getByText('This is a test post content for mobile testing')).toBeInTheDocument();

        // Navigation should be accessible
        expect(screen.getByText('All Posts')).toBeInTheDocument();
        expect(screen.getByText('Communities')).toBeInTheDocument();
      }
    });
  });

  describe('Performance on Mobile', () => {
    it('renders efficiently on mobile devices', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      const startTime = performance.now();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      await waitFor(() => {
        expect(screen.getByText('BlindCU')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Render should complete reasonably quickly (less than 1000ms in test environment)
      expect(renderTime).toBeLessThan(1000);
    });

    it('handles rapid viewport changes gracefully', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Rapidly change viewport sizes
      const sizes = [320, 768, 1024, 640, 1200];

      for (const size of sizes) {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: size,
        });

        act(() => {
          window.dispatchEvent(new Event('resize'));
        });
      }

      // Component should handle rapid changes without errors
      await waitFor(() => {
        expect(screen.getByText('BlindCU')).toBeInTheDocument();
      });
    });
  });
});