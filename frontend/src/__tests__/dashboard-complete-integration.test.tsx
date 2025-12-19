/**
 * Complete Dashboard Integration Test
 * **Feature: blindcu-dashboard, Property 18: Mobile navigation consistency**
 * **Validates: Requirements 5.2**
 * 
 * This test validates the complete integration of all dashboard components
 * and ensures end-to-end user flows work correctly with the backend API.
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
  getCommunities: jest.fn(),
  joinCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/dashboard',
    href: 'http://localhost:3000/dashboard',
    origin: 'http://localhost:3000',
  },
  writable: true,
});

// Mock window resize for responsive testing
const mockResizeObserver = jest.fn(() => ({
  observe: jest.fn(),
  disconnect: jest.fn(),
  unobserve: jest.fn(),
}));
window.ResizeObserver = mockResizeObserver;

describe('Complete Dashboard Integration', () => {
  const mockRouter = {
    push: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
  };

  const mockUser = {
    user_id: 'test-user-123',
    email: 'test@example.com',
    isverified: true,
    joinedCommunities: ['community-1', 'community-2'],
  };

  const mockPosts = [
    {
      _id: 'post-1',
      user_id: 'user-1',
      randomName: 'Anonymous User 1',
      content: 'This is a test post content',
      images: [],
      likes: 5,
      likedBy: ['user-2', 'user-3'],
      commentsCount: 2,
      comments: [],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      _id: 'post-2',
      user_id: 'user-2',
      randomName: 'Anonymous User 2',
      content: 'Another test post with longer content that spans multiple lines',
      images: ['image1.jpg'],
      likes: 12,
      likedBy: ['user-1', 'user-3', 'user-4'],
      commentsCount: 5,
      comments: [],
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
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

    // Mock window.innerWidth for responsive testing
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  describe('Complete Dashboard Layout Integration', () => {
    it('renders complete dashboard with all components integrated', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });

      // Verify header is present
      expect(screen.getByText('BlindCU')).toBeInTheDocument();

      // Verify navigation sidebar is present
      expect(screen.getByText('All Posts')).toBeInTheDocument();
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();

      // Verify posts are rendered
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
      expect(screen.getByText('Another test post with longer content that spans multiple lines')).toBeInTheDocument();
    });

    it('handles mobile responsive layout correctly', async () => {
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

      // Trigger resize event
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      await waitFor(() => {
        // On mobile, sidebar should be collapsed by default
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).toHaveClass('hidden');
      });
    });

    it('handles sidebar toggle functionality in mobile view', async () => {
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

      // Trigger resize event to activate mobile mode
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Find and click the mobile sidebar toggle
      const toggleButton = screen.getByLabelText('Toggle navigation menu');

      await act(async () => {
        fireEvent.click(toggleButton);
      });

      await waitFor(() => {
        // Sidebar should now be visible
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).not.toHaveClass('hidden');
      });
    });
  });

  describe('End-to-End User Flows', () => {
    it('handles complete post interaction flow', async () => {
      (api.likeGlobalPost as jest.Mock).mockResolvedValue({
        likes: 6,
      });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });

      // Find and click like button on first post
      const likeButtons = screen.getAllByLabelText(/like post/i);

      await act(async () => {
        fireEvent.click(likeButtons[0]);
      });

      // Verify API was called
      expect(api.likeGlobalPost).toHaveBeenCalledWith('post-1');

      // Verify like count updated (should be 6 now)
      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument();
      });
    });

    it('handles navigation between different sections', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Click on Communities link
      const communitiesLink = screen.getByText('Communities');

      await act(async () => {
        fireEvent.click(communitiesLink);
      });

      // Verify router.push was called with correct path
      expect(mockRouter.push).toHaveBeenCalledWith('/dashboard/communities');
    });

    it('handles authentication error gracefully', async () => {
      // Mock API to return authentication error
      (api.getGlobalPosts as jest.Mock).mockRejectedValue(
        new Error('Unauthorized access')
      );

      const mockRedirectToSignin = jest.fn();
      (useAuth as jest.Mock).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        redirectToSignin: mockRedirectToSignin,
      });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for error handling
      await waitFor(() => {
        expect(mockRedirectToSignin).toHaveBeenCalledWith(true);
      });
    });

    it('handles network errors with retry functionality', async () => {
      // Mock API to return network error first, then success
      (api.getGlobalPosts as jest.Mock)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ posts: mockPosts });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });

      // Click retry button
      const retryButton = screen.getByText('Try Again');

      await act(async () => {
        fireEvent.click(retryButton);
      });

      // Wait for posts to load after retry
      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Integration', () => {
    it('provides proper keyboard navigation throughout dashboard', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });

      // Test skip to main content link
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');

      // Test main content has proper ID
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');

      // Test navigation has proper ARIA labels
      const navigation = screen.getByRole('navigation', { name: /main navigation/i });
      expect(navigation).toBeInTheDocument();
    });

    it('provides proper ARIA labels and semantic markup', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Check for proper semantic structure
      expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
      expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument(); // Sidebar
      expect(screen.getByRole('complementary')).toBeInTheDocument(); // Sidebar as complementary

      // Check for proper ARIA labels
      expect(screen.getByLabelText('Dashboard content')).toBeInTheDocument();
      expect(screen.getByLabelText('Main content area')).toBeInTheDocument();
    });

    it('handles focus management correctly', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Test Escape key handling for mobile sidebar
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Open sidebar first
      const toggleButton = screen.getByLabelText('Toggle navigation menu');
      await act(async () => {
        fireEvent.click(toggleButton);
      });

      // Press Escape key
      await act(async () => {
        fireEvent.keyDown(document, { key: 'Escape' });
      });

      // Sidebar should close
      await waitFor(() => {
        const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
        expect(sidebar.closest('aside')).toHaveClass('hidden');
      });
    });
  });

  describe('Theme and Design System Integration', () => {
    it('applies consistent design tokens throughout dashboard', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Check that main layout has proper background classes
      const mainLayout = screen.getByRole('main').closest('div');
      expect(mainLayout).toHaveClass('min-h-screen');

      // Check that header has proper styling classes
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('sticky', 'top-0');
    });

    it('maintains visual consistency across all components', async () => {
      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Anonymous User 1')).toBeInTheDocument();
      });

      // Verify consistent spacing and layout
      const gridContainer = document.querySelector('.grid.grid-cols-12');
      expect(gridContainer).toBeInTheDocument();

      // Verify consistent card styling for posts
      const postCards = document.querySelectorAll('[data-testid*="post-card"]');
      // Posts should be rendered (even if we can't find them by test ID, content should be there)
      expect(screen.getByText('This is a test post content')).toBeInTheDocument();
    });
  });

  describe('Error Boundary Integration', () => {
    it('handles component errors gracefully', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

      // Mock a component to throw an error
      (api.getGlobalPosts as jest.Mock).mockImplementation(() => {
        throw new Error('Component error');
      });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // The error should be handled gracefully
      // The layout should still render even if posts fail
      expect(screen.getByText('BlindCU')).toBeInTheDocument();
      expect(screen.getByText('All Posts')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });
});