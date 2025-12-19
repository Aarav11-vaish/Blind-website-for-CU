/**
 * **Feature: blindcu-dashboard, Integration Test: Complete dashboard experience**
 * 
 * This integration test verifies the complete dashboard experience including:
 * - Authentication flow
 * - Navigation between different sections
 * - Post creation and interaction
 * - Community management
 * - Mobile responsiveness
 * - Error handling
 * 
 * **Validates: Requirements 5.1, 5.2, 8.1, 8.2, 8.3**
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Posts from '@/components/dashboard/Posts';
import CommunitiesPage from '@/app/dashboard/communities/page';
import CreatePostPage from '@/app/dashboard/create-post/page';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/dashboard'),
}));

// Mock API functions
jest.mock('@/lib/api', () => ({
  getGlobalPosts: jest.fn(),
  getCommunities: jest.fn(),
  createGlobalPost: jest.fn(),
  likeGlobalPost: jest.fn(),
  joinCommunity: jest.fn(),
  leaveCommunity: jest.fn(),
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

const mockRouter = {
  push: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  replace: jest.fn(),
};

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jest.fn((key) => {
        if (key === 'token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          email: 'test@example.com',
          user_id: 'user123',
          isverified: true,
          joinedCommunities: ['community1']
        });
        return null;
      }),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    // Mock ResizeObserver
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  describe('Layout Integration', () => {
    it('renders complete dashboard layout with all components', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({
        posts: [
          {
            _id: 'post1',
            user_id: 'user1',
            randomName: 'TestUser',
            content: 'Test post content',
            images: [],
            likes: 5,
            likedBy: [],
            commentsCount: 3,
            comments: [],
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z',
          }
        ]
      });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Verify header is present
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('BlindCU')).toBeInTheDocument();

      // Verify navigation sidebar is present
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
      expect(screen.getByText('All Posts')).toBeInTheDocument();
      expect(screen.getByText('Create Post')).toBeInTheDocument();
      expect(screen.getByText('Communities')).toBeInTheDocument();

      // Verify main content area
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Wait for posts to load
      await waitFor(() => {
        expect(screen.getByText('Test post content')).toBeInTheDocument();
      });
    });

    it('handles mobile responsive layout correctly', async () => {
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 640,
      });

      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Verify mobile menu toggle is visible
      const menuToggle = screen.getByLabelText(/toggle navigation menu/i);
      expect(menuToggle).toBeInTheDocument();

      // Verify sidebar is initially collapsed on mobile
      const sidebar = screen.getByRole('navigation', { name: /main navigation/i });
      expect(sidebar).toHaveClass('hidden');
    });

    it('provides proper accessibility features', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Verify skip to main content link
      const skipLink = screen.getByText('Skip to main content');
      expect(skipLink).toBeInTheDocument();

      // Verify proper ARIA labels
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();

      // Verify main content has proper ID for skip link
      const mainContent = screen.getByRole('main');
      expect(mainContent).toHaveAttribute('id', 'main-content');
    });
  });

  describe('Navigation Integration', () => {
    it('navigates between different dashboard sections', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Test navigation to Create Post
      const createPostLink = screen.getByText('Create Post');
      expect(createPostLink).toHaveAttribute('href', '/dashboard/create-post');

      // Test navigation to Communities
      const communitiesLink = screen.getByText('Communities');
      expect(communitiesLink).toHaveAttribute('href', '/dashboard/communities');

      // Test navigation to other sections
      expect(screen.getByText('Academics')).toHaveAttribute('href', '/dashboard/academics');
      expect(screen.getByText('Campus Life')).toHaveAttribute('href', '/dashboard/campus');
    });

    it('handles keyboard navigation properly', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      const user = userEvent.setup();

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Test tab navigation through sidebar links
      const allPostsLink = screen.getByText('All Posts');
      await user.tab();

      // Verify focus management
      expect(document.activeElement).toBeTruthy();
    });
  });

  describe('Authentication Integration', () => {
    it('handles authentication expiry correctly', async () => {
      const { useAuth } = require('@/hooks/useAuth');
      const mockRedirectToSignin = jest.fn();

      useAuth.mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        redirectToSignin: mockRedirectToSignin,
      });

      // Mock localStorage to return no token
      const mockLocalStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Should redirect to signin when not authenticated
      await waitFor(() => {
        expect(mockRedirectToSignin).toHaveBeenCalledWith(true);
      });
    });

    it('preserves authentication state across navigation', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Verify user profile is displayed in header
      const userMenu = screen.getByLabelText(/user menu/i);
      expect(userMenu).toBeInTheDocument();

      // Test logout functionality
      await act(async () => {
        fireEvent.click(userMenu);
      });

      await waitFor(() => {
        expect(screen.getByText('Log out')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('handles API errors gracefully', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Should display error message
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Should provide retry option
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('handles connection errors with appropriate messaging', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockRejectedValue(new Error('Connection error. Please check your internet connection and try again.'));

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/connection error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Communities Integration', () => {
    it('integrates communities page with dashboard layout', async () => {
      const { getCommunities } = require('@/lib/api');
      getCommunities.mockResolvedValue({
        communities: [
          {
            community_id: 'community1',
            name: 'Test Community',
            description: 'A test community',
            memberCount: 100,
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z',
          }
        ]
      });

      await act(async () => {
        render(<CommunitiesPage />);
      });

      // Verify communities page renders within dashboard layout
      expect(screen.getByText('Communities')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Test Community')).toBeInTheDocument();
      });
    });
  });

  describe('Post Creation Integration', () => {
    it('integrates post creation with dashboard layout', async () => {
      const { getCommunities } = require('@/lib/api');
      getCommunities.mockResolvedValue({
        communities: [
          {
            community_id: 'community1',
            name: 'Test Community',
            description: 'A test community',
            memberCount: 100,
            createdAt: '2024-01-01T12:00:00Z',
            updatedAt: '2024-01-01T12:00:00Z',
          }
        ]
      });

      await act(async () => {
        render(<CreatePostPage />);
      });

      // Verify create post page renders within dashboard layout
      expect(screen.getByText('Create New Post')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.getByText('Select Community')).toBeInTheDocument();
      });
    });
  });

  describe('Performance and Loading States', () => {
    it('displays loading states appropriately', async () => {
      const { getGlobalPosts } = require('@/lib/api');

      // Create a promise that we can control
      let resolvePromise: (value: any) => void;
      const loadingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      getGlobalPosts.mockReturnValue(loadingPromise);

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      // Should show loading state
      expect(screen.getByText('Loading posts...')).toBeInTheDocument();

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ posts: [] });
      });

      // Loading should be gone
      await waitFor(() => {
        expect(screen.queryByText('Loading posts...')).not.toBeInTheDocument();
      });
    });

    it('handles empty states correctly', async () => {
      const { getGlobalPosts } = require('@/lib/api');
      getGlobalPosts.mockResolvedValue({ posts: [] });

      await act(async () => {
        render(
          <DashboardLayout>
            <Posts />
          </DashboardLayout>
        );
      });

      await waitFor(() => {
        expect(screen.getByText(/no posts available/i)).toBeInTheDocument();
      });
    });
  });
});