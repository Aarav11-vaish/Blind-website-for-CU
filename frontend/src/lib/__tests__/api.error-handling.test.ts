/**
 * **Feature: blindcu-dashboard, Property 32: Network error handling consistency**
 * **Validates: Requirements 8.2**
 *
 * Property-based test for API network error handling consistency.
 * Tests that Backend_API request failures are handled gracefully with user-friendly messages.
 */

import * as fc from "fast-check";
import {
  getGlobalPosts,
  createGlobalPost,
  likeGlobalPost,
  getCommunities,
  joinCommunity,
  leaveCommunity,
  requestOTP,
  verifyOTP,
} from "../api";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("API Error Handling Property Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockReturnValue("mock-token");
  });

  /**
   * Property 32: Network error handling consistency - Error instances are preserved
   * For any Backend_API request failure that throws an Error, the system should preserve
   * the original error message for debugging while ensuring it's still an Error instance
   */
  test("Property 32: Network error handling consistency - Error instances preserved", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Different types of network errors that can occur
          fc.constant(new TypeError("Failed to fetch")), // Network connectivity issues
          fc.constant(
            new TypeError("NetworkError when attempting to fetch resource")
          ), // Network errors
          fc.constant(new Error("ECONNREFUSED")), // Connection refused
          fc.constant(new Error("ETIMEDOUT")), // Timeout errors
          fc.constant(new Error("ENOTFOUND")) // DNS resolution errors
        ),
        async (networkError) => {
          // Setup: Mock fetch to throw network error
          mockFetch.mockRejectedValue(networkError);

          // Test all API functions handle network errors consistently
          const apiCalls = [
            () => getGlobalPosts(),
            () => createGlobalPost({ content: "test content" }),
            () => likeGlobalPost("test-id"),
            () => getCommunities(),
            () => joinCommunity({ community_id: "test-id" }),
            () => leaveCommunity({ community_id: "test-id" }),
            () => requestOTP("test@example.com"),
            () => verifyOTP("test@example.com", "123456"),
          ];

          for (const apiCall of apiCalls) {
            try {
              await apiCall();
              // Should not reach here - all calls should throw
              expect(true).toBe(false);
            } catch (error) {
              // Verify that Error instances are preserved (actual API behavior)
              expect(error).toBeInstanceOf(Error);
              expect(error.message).toBe(networkError.message);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32: Network error handling consistency - Non-Error exceptions get user-friendly messages
   * For any Backend_API request failure that throws a non-Error, the system should convert it
   * to a user-friendly network error message
   */
  test("Property 32: Network error handling consistency - Non-Error exceptions", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          // Non-Error exceptions that might be thrown
          fc.constant("string error"),
          fc.constant(null),
          fc.constant(undefined),
          fc.constant({ error: "object error" }),
          fc.constant(404)
        ),
        async (nonErrorException) => {
          // Setup: Mock fetch to throw non-Error exception
          mockFetch.mockRejectedValue(nonErrorException);

          // Test all API functions handle non-Error exceptions consistently
          const apiCalls = [
            () => getGlobalPosts(),
            () => createGlobalPost({ content: "test content" }),
            () => likeGlobalPost("test-id"),
            () => getCommunities(),
            () => joinCommunity({ community_id: "test-id" }),
            () => leaveCommunity({ community_id: "test-id" }),
            () => requestOTP("test@example.com"),
            () => verifyOTP("test@example.com", "123456"),
          ];

          for (const apiCall of apiCalls) {
            try {
              await apiCall();
              // Should not reach here - all calls should throw
              expect(true).toBe(false);
            } catch (error) {
              // Verify that non-Error exceptions are converted to user-friendly messages
              expect(error).toBeInstanceOf(Error);
              expect(error.message).toBe(
                "Network error: Could not connect to server. Make sure the backend is running."
              );
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32 Extension: HTTP error responses are handled gracefully
   */
  test("Property 32 Extension: HTTP error responses are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          status: fc.integer({ min: 400, max: 599 }), // HTTP error status codes
          errorMessage: fc.string({ minLength: 1, maxLength: 100 }),
        }),
        async ({ status, errorMessage }) => {
          // Setup: Mock fetch to return HTTP error response
          mockFetch.mockResolvedValue({
            ok: false,
            status,
            json: async () => ({ message: errorMessage }),
          });

          // Test that HTTP errors are handled consistently across all API functions
          const apiCalls = [
            () => getGlobalPosts(),
            () => createGlobalPost({ content: "test content" }),
            () => likeGlobalPost("test-id"),
            () => getCommunities(),
            () => joinCommunity({ community_id: "test-id" }),
            () => leaveCommunity({ community_id: "test-id" }),
            () => requestOTP("test@example.com"),
            () => verifyOTP("test@example.com", "123456"),
          ];

          for (const apiCall of apiCalls) {
            try {
              await apiCall();
              // Should not reach here - all calls should throw
              expect(true).toBe(false);
            } catch (error) {
              // Verify that HTTP errors preserve the server error message
              expect(error).toBeInstanceOf(Error);
              expect(error.message).toBe(errorMessage);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32 Extension: JSON parsing errors are handled gracefully
   */
  test("Property 32 Extension: JSON parsing errors are handled gracefully", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          status: fc.integer({ min: 400, max: 599 }),
        }),
        async ({ status }) => {
          // Setup: Mock fetch to return response that fails JSON parsing
          mockFetch.mockResolvedValue({
            ok: false,
            status,
            json: async () => {
              throw new SyntaxError("Unexpected token in JSON");
            },
          });

          // Test that JSON parsing errors are handled consistently
          const apiCalls = [
            () => getGlobalPosts(),
            () => getCommunities(),
            () => requestOTP("test@example.com"),
          ];

          for (const apiCall of apiCalls) {
            try {
              await apiCall();
              // Should not reach here - all calls should throw
              expect(true).toBe(false);
            } catch (error) {
              // Verify that JSON parsing errors are preserved as Error instances
              expect(error).toBeInstanceOf(Error);
              expect(error.message).toBe("Unexpected token in JSON");
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Property 32 Extension: API calls with missing error messages provide fallbacks
   */
  test("Property 32 Extension: API calls with missing error messages provide fallbacks", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          status: fc.integer({ min: 400, max: 599 }),
          hasMessage: fc.boolean(),
        }),
        async ({ status, hasMessage }) => {
          // Setup: Mock fetch to return error response with or without message
          mockFetch.mockResolvedValue({
            ok: false,
            status,
            json: async () => (hasMessage ? { message: "" } : {}), // Empty or missing message
          });

          const apiCallsWithFallbacks = [
            {
              call: () => getGlobalPosts(),
              fallback: "Failed to fetch global posts",
            },
            {
              call: () => createGlobalPost({ content: "test" }),
              fallback: "Failed to create post",
            },
            {
              call: () => likeGlobalPost("test-id"),
              fallback: "Failed to like post",
            },
            {
              call: () => getCommunities(),
              fallback: "Failed to fetch communities",
            },
            {
              call: () => joinCommunity({ community_id: "test-id" }),
              fallback: "Failed to join community",
            },
            {
              call: () => leaveCommunity({ community_id: "test-id" }),
              fallback: "Failed to leave community",
            },
            {
              call: () => requestOTP("test@example.com"),
              fallback: "Failed to send OTP",
            },
            {
              call: () => verifyOTP("test@example.com", "123456"),
              fallback: "Failed to verify OTP",
            },
          ];

          for (const { call, fallback } of apiCallsWithFallbacks) {
            try {
              await call();
              // Should not reach here - all calls should throw
              expect(true).toBe(false);
            } catch (error) {
              // Verify that missing error messages result in appropriate fallback messages
              expect(error).toBeInstanceOf(Error);
              expect(error.message).toBe(fallback);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
