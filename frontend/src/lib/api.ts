/**
 * Simplified API - Essential functions only
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Basic interfaces
export interface GlobalPost {
  _id: string;
  user_id: string;
  randomName: string;
  content: string;
  images: string[];
  likes: number;
  likedBy: string[];
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  community_id: string;
  name: string;
  description: string;
  memberCount: number;
  icon?: string;
  createdAt?: string;
}

// Legacy interfaces for compatibility
export interface CreatePostData {
  content: string;
  images?: File[];
}

export interface CreateCommunityPostData {
  content: string;
  images?: File[];
  community_id: string;
}

// Search interfaces (for components that use search)
export interface SearchQuery {
  text?: string;
  communityId?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sortBy?: "date" | "likes" | "comments";
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  posts: GlobalPost[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
  searchQuery?: string;
  appliedFilters?: {
    communityId?: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
    sortBy?: "date" | "likes" | "comments";
  };
}

export interface SearchSuggestion {
  text: string;
  type: "content" | "user" | "community";
  count?: number;
}

// Additional interfaces for compatibility
export interface JoinCommunityData {
  community_id: string;
}

// Helper functions
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function getAuthHeadersForFormData(): HeadersInit {
  const token = localStorage.getItem("token");
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

function handleAuthError(): void {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/signin";
}

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      handleAuthError();
      return;
    }
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || `Request failed: ${response.status}`);
  }
  return response.json();
}

// Essential API functions
export async function requestOTP(email: string) {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

export async function verifyOTP(email: string, enteredOtp: string) {
  const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, enteredOtp }),
  });
  return handleResponse(response);
}

export async function getGlobalPosts() {
  const response = await fetch(`${API_BASE_URL}/globalpost/getglobalposts`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function createGlobalPost(
  postData: CreatePostData | { content: string; images?: File[] }
) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.user_id) throw new Error("User not found");

  const formData = new FormData();
  formData.append("user_id", user.user_id);
  formData.append(
    "randomName",
    user.randomName || `Anonymous${Math.floor(Math.random() * 1000)}`
  );
  formData.append("content", postData.content);

  if (postData.images) {
    postData.images.forEach((image) => formData.append("images", image));
  }

  const response = await fetch(`${API_BASE_URL}/globalpost/createglobalposts`, {
    method: "POST",
    headers: getAuthHeadersForFormData(),
    body: formData,
  });
  return handleResponse(response);
}

export async function likeGlobalPost(postId: string) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.user_id) throw new Error("User not found");

  const response = await fetch(`${API_BASE_URL}/globalpost/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: user.user_id }),
  });
  return handleResponse(response);
}

export async function getCommunities() {
  const response = await fetch(`${API_BASE_URL}/community/getcommunities`, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function joinCommunity(communityData: string | JoinCommunityData) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.user_id) throw new Error("User not found");

  const communityId =
    typeof communityData === "string"
      ? communityData
      : communityData.community_id;

  const response = await fetch(`${API_BASE_URL}/community/joincommunity`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: user.user_id, community_id: communityId }),
  });
  return handleResponse(response);
}

export async function updateUserProfile(userId: string, profileData: unknown) {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/profile/submit`,
    {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    }
  );
  return handleResponse(response);
}

export async function createCommunityPost(postData: CreateCommunityPostData) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.user_id) throw new Error("User not found");

  const formData = new FormData();
  formData.append("user_id", user.user_id);
  formData.append(
    "randomName",
    user.randomName || `Anonymous${Math.floor(Math.random() * 1000)}`
  );
  formData.append("content", postData.content);
  formData.append("community_id", postData.community_id);

  if (postData.images) {
    postData.images.forEach((image) => formData.append("images", image));
  }

  const response = await fetch(
    `${API_BASE_URL}/community/${postData.community_id}/posts`,
    {
      method: "POST",
      headers: getAuthHeadersForFormData(),
      body: formData,
    }
  );
  return handleResponse(response);
}

// Additional functions for compatibility
export async function leaveCommunity(
  communityData: string | JoinCommunityData
) {
  const userData = localStorage.getItem("user");
  const user = userData ? JSON.parse(userData) : null;

  if (!user?.user_id) throw new Error("User not found");

  const communityId =
    typeof communityData === "string"
      ? communityData
      : communityData.community_id;

  const response = await fetch(`${API_BASE_URL}/community/leavecommunity`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ user_id: user.user_id, community_id: communityId }),
  });
  return handleResponse(response);
}

export async function getUserPosts(
  userId: string,
  page?: number,
  limit?: number
) {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const url = `${API_BASE_URL}/user/${userId}/posts${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function deleteUserPost(userId: string, postId: string) {
  const response = await fetch(
    `${API_BASE_URL}/user/${userId}/posts/${postId}`,
    {
      method: "DELETE",
      headers: getAuthHeaders(),
    }
  );
  return handleResponse(response);
}

export async function getCommunityPosts(
  communityId: string,
  page?: number,
  limit?: number
) {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append("page", page.toString());
  if (limit) queryParams.append("limit", limit.toString());

  const url = `${API_BASE_URL}/community/${communityId}/posts${
    queryParams.toString() ? "?" + queryParams.toString() : ""
  }`;

  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

export async function getFilteredCommunityPosts(communityId: string) {
  // Simple fallback - just return all posts for now
  const posts = await getGlobalPosts();
  const communities = await getCommunities();

  const community =
    communities.communities?.find(
      (c: Community) => c.community_id === communityId
    ) || null;

  return {
    posts: posts.posts || [],
    community,
  };
}

// Search functions (simplified)
export async function searchPosts(query: SearchQuery) {
  // Simple fallback - filter global posts
  const posts = await getGlobalPosts();
  let filteredPosts = posts.posts || [];

  if (query.text) {
    const searchText = query.text.toLowerCase();
    filteredPosts = filteredPosts.filter((post: GlobalPost) =>
      post.content.toLowerCase().includes(searchText)
    );
  }

  return {
    posts: filteredPosts,
    totalCount: filteredPosts.length,
    page: query.page || 1,
    limit: query.limit || 10,
    hasMore: false,
    searchQuery: query.text,
    appliedFilters: {
      communityId: query.communityId,
      dateRange: query.dateRange,
      sortBy: query.sortBy,
    },
  };
}

export async function getSearchSuggestions(query: string) {
  // Simple fallback - return empty suggestions
  return {
    suggestions: [],
  };
}

export async function fallbackSearchPosts(query: SearchQuery) {
  return searchPosts(query);
}
