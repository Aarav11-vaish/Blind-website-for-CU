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

export async function requestOTP(email: string): Promise<SignupResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to send OTP");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Network error: Could not connect to server. Make sure the backend is running."
    );
  }
}

export async function verifyOTP(
  email: string,
  enteredOtp: string
): Promise<VerifyOTPResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, enteredOtp }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to verify OTP");
    }

    return data;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(
      "Network error: Could not connect to server. Make sure the backend is running."
    );
  }
}
