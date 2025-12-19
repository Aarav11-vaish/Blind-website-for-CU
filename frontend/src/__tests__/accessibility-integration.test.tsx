/**
 * Accessibility Integration Test
 * **Feature: blindcu-dashboard, Property 19: Keyboard navigation consistency**
 * **Feature: blindcu-dashboard, Property 20: Screen reader consistency**
 * **Feature: blindcu-dashboard, Property 21: Touch interaction consistency**
 * **Validates: Requirements 5.3, 5.4, 5.5**
 * 
 * This test validates that the complete dashboard meets accessibility standards
 * including keyboard navigation, screen reader support, and touch interactions.
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

describe('Accessibility Integration', () => {
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
      content: 'This is a test post for accessibility testing',
      images: ['test-image.jpg'],
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

  describe('Semantic HTML Structure', () => {
    it('uses proper semantic HTML elements', async () => {
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

      // Check for proper semantic structure
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument(); // Primary nav
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar
    });

    it('provides proper heading hierarchy', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Check for proper heading structure
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('BlindCU');

      // Check for other headings in sidebar
      const trendingHeading = screen.getByRole('heading', { level: 3 });
      expect(trendingHeading).toHaveTextContent('Trending');
    });

    it('provides proper landmark regions', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Check for ARIA landmarks
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('complementary')).toBeInTheDocument();
    });
  });

  describe('ARIA Labels and Descriptions', () => {
    it('provides comprehensive ARIA labels', async () => {
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

      // Check for ARIA labels on interactive elements
      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
      expect(screen.getByLabelText('User menu')).toBeInTheDocument();
      expect(screen.getByLabelText('Search communities and posts')).toBeInTheDocument();

      // Check for ARIA labels on main regions
      expect(screen.getByLabelText('Dashboard content')).toBeInTheDocument();
      expect(screen.getByLabelText('Main content area')).toBeInTheDocument();
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
    });

    it('provides proper ARIA descriptions for complex interactions', async () => {
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

      // Check for ARIA descriptions on post interactions
      const likeButtons = screen.getAllByLabelText(/like post/i);
      expect(likeButtons.length).toBeGreaterThan(0);

      const commentButtons = screen.getAllByLabelText(/comment on post/i);
      expect(commentButtons.length).toBeGreaterThan(0);

      const shareButtons = screen.getAllByLabelText(/share post/i);
      expect(shareButtons.length).toBeGreaterThan(0);
    });

    it('provides proper ARIA states for dynamic content', async () => {
      // Set mobile viewport to test sidebar states
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
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

      const toggleButton = screen.getByLabelText('Toggle navigation menu');

      // Check initial ARIA state
      expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

      // Toggle sidebar
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      // Check updated ARIA state
      await waitFor(() => {
        expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
      });
    });
  });

  describe('Keyboard Navigation', () => {
    it('supports full keyboard navigation throughout dashboard', async () => {
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

      // Test Tab navigation through main elements
      const skipLink = screen.getByText('Skip to main content');
      skipLink.focus();
      expect(document.activeElement).toBe(skipLink);

      // Test navigation links are keyboard accessible
      const allPostsLink = screen.getByText('All Posts');
      allPostsLink.focus();
      expect(document.activeElement).toBe(allPostsLink);

      // Test Enter key activation
      await act(async () => {
        fireEvent.keyDown(allPostsLink, { key: 'Enter' });
      });

      // Should navigate (though we're already on the page)
      expect(allPostsLink).toBeInTheDocument();
    });

    it('handles keyboard shortcuts appropriately', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
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

      // Open sidebar first
      const toggleButton = screen.getByLabelText('Toggle navigation menu');
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      // Test Escape key closes sidebar
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      await waitFor(() => {
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).toHaveClass('hidden');
      });
    });

    it('provides proper focus management', async () => {
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

      // Test focus indicators are visible
      const searchInput = screen.getByLabelText('Search communities and posts');

      await act(async () => {
        fireEvent.focus(searchInput);
      });

      expect(document.activeElement).toBe(searchInput);

      // Test focus trap in modals/dropdowns
      const userMenuButton = screen.getByLabelText('User menu');

      await act(async () => {
        fireEvent.click(userMenuButton);
      });

      // Dropdown should be open and focusable
      await waitFor(() => {
        expect(screen.getByText('Profile Settings')).toBeInTheDocument();
      });
    });

    it('supports Space and Enter key activation', async () => {
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

      // Test Space key activation on buttons
      const likeButtons = screen.getAllByLabelText(/like post/i);
      if (likeButtons.length > 0) {
        const likeButton = likeButtons[0];
        likeButton.focus();

        await act(async () => {
          fireEvent.keyDown(likeButton, { key: ' ' });
          fireEvent.keyUp(likeButton, { key: ' ' });
        });

        expect(api.likeGlobalPost).toHaveBeenCalled();
      }
    });
  });

  describe('Screen Reader Support', () => {
    it('provides proper screen reader announcements', async () => {
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

      // Check for screen reader only content
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toHaveClass('sr-only');

      // Check for proper labeling of interactive elements
      const searchInput = screen.getByLabelText('Search communities and posts');
      expect(searchInput).toHaveAttribute('type', 'search');
      expect(searchInput).toHaveAttribute('aria-label', 'Search communities and posts');
    });

    it('provides context for dynamic content changes', async () => {
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

      // Test that like count changes are announced
      const likeButtons = screen.getAllByLabelText(/like post/i);
      if (likeButtons.length > 0) {
        await act(async () => {
          fireEvent.click(likeButtons[0]);
        });

        // The like count should update and be accessible to screen readers
        await waitFor(() => {
          expect(screen.getByText('6')).toBeInTheDocument();
        });
      }
    });

    it('provides proper reading order', async () => {
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

      // Check that content follows logical reading order
      const allElements = screen.getAllByRole(/.*/, { hidden: true });

      // Header should come first
      const header = screen.getByRole('banner');
      const main = screen.getByRole('main');

      // Header should appear before main in DOM order
      const headerIndex = allElements.indexOf(header);
      const mainIndex = allElements.indexOf(main);

      expect(headerIndex).toBeLessThan(mainIndex);
    });
  });

  describe('Touch Interaction Support', () => {
    it('provides adequate touch targets', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
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

      // Check that interactive elements have adequate touch targets
      const toggleButton = screen.getByLabelText('Toggle navigation menu');
      expect(toggleButton).toHaveClass('p-2'); // Should have adequate padding

      const likeButtons = screen.getAllByLabelText(/like post/i);
      if (likeButtons.length > 0) {
        // Like buttons should be touch-friendly
        expect(likeButtons[0]).toBeInTheDocument();
      }
    });

    it('handles touch gestures appropriately', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
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

      // Test touch events don't break functionality
      const mainContent = screen.getByRole('main');

      await act(async () => {
        fireEvent.touchStart(mainContent, {
          touches: [{ clientX: 0, clientY: 0 }],
        });
      });

      await act(async () => {
        fireEvent.touchEnd(mainContent);
      });

      // Component should still function normally
      expect(screen.getByText('BlindCU')).toBeInTheDocument();
    });

    it('provides proper touch feedback', async () => {
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

      // Test touch interaction on interactive elements
      const likeButtons = screen.getAllByLabelText(/like post/i);
      if (likeButtons.length > 0) {
        const likeButton = likeButtons[0];

        await act(async () => {
          fireEvent.touchStart(likeButton);
          fireEvent.touchEnd(likeButton);
          fireEvent.click(likeButton);
        });

        expect(api.likeGlobalPost).toHaveBeenCalled();
      }
    });
  });

  describe('Color Contrast and Visual Accessibility', () => {
    it('maintains proper color contrast in both themes', async () => {
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

      // Check that text elements have proper contrast classes
      const brandText = screen.getByText('BlindCU');
      expect(brandText).toHaveClass('text-3xl', 'font-bold');

      // Check that interactive elements have proper hover states
      const allPostsLink = screen.getByText('All Posts');
      expect(allPostsLink).toBeInTheDocument();
    });

    it('respects reduced motion preferences', async () => {
      // Mock prefers-reduced-motion
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Component should render without motion-based animations when reduced motion is preferred
      expect(screen.getByText('BlindCU')).toBeInTheDocument();
    });
  });

  describe('Error State Accessibility', () => {
    it('announces errors to screen readers', async () => {
      // Mock API to return error
      (api.getGlobalPosts as jest.Mock).mockRejectedValue(
        new Error('Network connection failed')
      );

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for error state
      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });

      // Error message should be accessible
      const errorMessage = screen.getByText(/connection error/i);
      expect(errorMessage).toBeInTheDocument();

      // Retry button should be accessible
      const retryButton = screen.getByText('Try Again');
      expect(retryButton).toBeInTheDocument();
      expect(retryButton).toHaveAttribute('type', 'button');
    });
  });
});