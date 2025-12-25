// Simple profile validation

export interface ProfileFormData {
  userName?: string;
  graduationYear?: string;
  bio?: string;
}

export function validateField(field: string, value: any) {
  return { isValid: true, error: null };
}

export function validateProfileForm(data: ProfileFormData) {
  return {
    isValid: true,
    errors: {},
    fieldErrors: {
      userName: "",
      graduationYear: "",
      bio: "",
    },
  };
}

export function hasFormChanged(original: any, current: any) {
  return JSON.stringify(original) !== JSON.stringify(current);
}

export function sanitizeProfileData(data: ProfileFormData) {
  return data;
}

export function getCharacterCount(text: string) {
  return text?.length || 0;
}
