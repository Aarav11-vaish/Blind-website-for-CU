import { parseError, logError } from "./errorHandler";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export interface SignupResponse {
  message: string;
}

export interface VerifyOTPResponse {
  message: string;
  user: {
    email: string;
    user_id: string;
    isverified: boolean;
  };
  token: string;
}

export interface ApiError {
  message: string;
}

/**
 * Enhanced error handling for API responses
 */
function handleApiError(error: unknown, context: string): never {
  const parsed = parseError(error);
  logError(error, context);
  throw new Error(parsed.message);
}

/**
 * Check if response indicates authentication failure
 */
function isAuthError(response: Response): boolean {
  return response.status === 401 || response.status === 403;
}

/**
 * Check if response indicates server error
 */
function isServerError(response: Response): boolean {
  return response.status >= 500;
}

/**
 * Check if response indicates network error
 */
function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes("fetch");
}

export async function requestOTP(email: string): Promise<SignupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication failed. Please check your email.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "requestOTP"
      );
    }
    handleApiError(error, "requestOTP");
  }
}

export async function verifyOTP(
  email: string,
  enteredOtp: string
): Promise<VerifyOTPResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, enteredOtp }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Invalid OTP. Please check the code and try again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to verify OTP");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "verifyOTP"
      );
    }
    handleApiError(error, "verifyOTP");
  }
}

// Helper function to get authentication headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Helper function to get auth headers for FormData requests
function getAuthHeadersForFormData(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

// Post-related interfaces
export interface GlobalPost {
  _id: string;
  user_id: string;
  randomName: string;
  content: string;
  images: string[];
  likes: number;
  likedBy: string[];
  commentsCount: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  user_id: string;
  randomName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  content: string;
  images?: File[];
}

// Community-related interfaces
export interface Community {
  community_id: string;
  name: string;
  description: string;
  icon?: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JoinCommunityData {
  community_id: string;
}

// API Response interfaces
export interface PostsResponse {
  message: string;
  posts: GlobalPost[];
}

export interface CommunitiesResponse {
  message: string;
  communities: Community[];
}

export interface CreatePostResponse {
  message: string;
  post: GlobalPost;
}

export interface LikePostResponse {
  message: string;
  likes: number;
}

export interface CommunityActionResponse {
  message: string;
}

// Global Posts API functions
export async function getGlobalPosts(): Promise<PostsResponse> {
  try {
    const token = localStorage.getItem("token");
    console.log("Token from localStorage:", token ? "exists" : "missing");
    console.log("API URL:", `${API_BASE_URL}/globalpost/getglobalposts`);

    const headers = getAuthHeaders();
    console.log("Request headers:", headers);

    const response = await fetch(`${API_BASE_URL}/globalpost/getglobalposts`, {
      method: "GET",
      headers: headers,
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to fetch global posts");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "getGlobalPosts"
      );
    }
    handleApiError(error, "getGlobalPosts");
  }
}

export async function createGlobalPost(
  postData: CreatePostData
): Promise<CreatePostResponse> {
  try {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.user_id) {
      throw new Error("User not found. Please sign in again.");
    }

    const formData = new FormData();
    formData.append("user_id", user.user_id);
    formData.append(
      "randomName",
      user.randomName || `Anonymous${Math.floor(Math.random() * 1000)}`
    );
    formData.append("content", postData.content);

    if (postData.images) {
      postData.images.forEach((image) => {
        formData.append("images", image);
      });
    }

    const response = await fetch(
      `${API_BASE_URL}/globalpost/createglobalposts`,
      {
        method: "POST",
        headers: getAuthHeadersForFormData(),
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to create post");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "createGlobalPost"
      );
    }
    handleApiError(error, "createGlobalPost");
  }
}

export async function likeGlobalPost(
  postId: string
): Promise<LikePostResponse> {
  try {
    // Get user_id from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.user_id) {
      throw new Error("User not found. Please sign in again.");
    }

    const response = await fetch(`${API_BASE_URL}/globalpost/${postId}/like`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ user_id: user.user_id }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to like post");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "likeGlobalPost"
      );
    }
    handleApiError(error, "likeGlobalPost");
  }
}

// Communities API functions
export async function getCommunities(): Promise<CommunitiesResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/community/getcommunities`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to fetch communities");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "getCommunities"
      );
    }
    handleApiError(error, "getCommunities");
  }
}

export async function joinCommunity(
  communityData: JoinCommunityData
): Promise<CommunityActionResponse> {
  try {
    // Get user_id from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.user_id) {
      throw new Error("User not found. Please sign in again.");
    }

    const requestBody = {
      user_id: user.user_id,
      community_id: communityData.community_id,
    };

    const response = await fetch(`${API_BASE_URL}/community/joincommunity`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to join community");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "joinCommunity"
      );
    }
    handleApiError(error, "joinCommunity");
  }
}

export async function leaveCommunity(
  communityData: JoinCommunityData
): Promise<CommunityActionResponse> {
  try {
    // Get user_id from localStorage
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!user || !user.user_id) {
      throw new Error("User not found. Please sign in again.");
    }

    const requestBody = {
      user_id: user.user_id,
      community_id: communityData.community_id,
    };

    const response = await fetch(`${API_BASE_URL}/community/leavecommunity`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      if (isAuthError(response)) {
        throw new Error("Authentication required. Please sign in again.");
      }
      if (isServerError(response)) {
        throw new Error("Server error. Please try again in a moment.");
      }
      throw new Error(data.message || "Failed to leave community");
    }

    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      handleApiError(
        "Network error: Could not connect to server. Make sure the backend is running.",
        "leaveCommunity"
      );
    }
    handleApiError(error, "leaveCommunity");
  }
}
