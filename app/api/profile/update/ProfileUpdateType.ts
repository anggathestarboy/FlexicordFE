// ============================================================
// Profile Update API Types
// Endpoint: POST /auth/profile
// ============================================================

/**
 * Request body untuk update profil.
 * Dikirim sebagai multipart/form-data karena avatar_url bisa berupa file binary.
 */
export interface ProfileUpdateRequestBody {
  /**
   * Username baru pengguna.
   * - Required
   * - Maks 12 karakter
   * - Hanya boleh huruf, angka, dan underscore (^[a-zA-Z0-9_]+$)
   */
  username: string;

  /**
   * Email baru pengguna.
   * - Required
   * - Format email valid
   * - Maks 255 karakter
   */
  email: string;

  /**
   * Avatar pengguna.
   * - Opsional (bisa null)
   * - Binary file (gambar) atau null
   * - Maks 2048 karakter (URL) jika berupa string
   */
  avatar_url?: File | string | null;

  /**
   * Bio pengguna.
   * - Opsional (bisa null)
   */
  bio?: string | null;
}

// ─── Validation ───────────────────────────────────────────────────────────────

/** Regex pattern untuk validasi username sesuai spesifikasi backend */
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

/** Validasi field username */
export function validateUsername(username: string): string | null {
  if (!username || username.trim() === "") return "Username wajib diisi.";
  if (username.length > 12) return "Username maksimal 12 karakter.";
  if (!USERNAME_PATTERN.test(username))
    return "Username hanya boleh mengandung huruf, angka, dan underscore (_).";
  return null;
}

/** Validasi field email */
export function validateEmail(email: string): string | null {
  if (!email || email.trim() === "") return "Email wajib diisi.";
  if (email.length > 255) return "Email maksimal 255 karakter.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Format email tidak valid.";
  return null;
}

// ─── Response types ───────────────────────────────────────────────────────────

/** Response sukses dari backend */
export interface ProfileUpdateSuccessResponse {
  message: string;
}

/** Response error validasi dari backend (422) */
export interface ProfileUpdateValidationError {
  message: string;
  errors: Record<string, string[]>;
}

/** Response error umum */
export interface ProfileUpdateErrorResponse {
  message: string;
  error?: string;
}

/** Union type semua kemungkinan response */
export type ProfileUpdateApiResponse =
  | ProfileUpdateSuccessResponse
  | ProfileUpdateErrorResponse
  | ProfileUpdateValidationError;

// ─── Type guard ───────────────────────────────────────────────────────────────

export function isValidationError(
  res: ProfileUpdateApiResponse
): res is ProfileUpdateValidationError {
  return "errors" in res;
}
