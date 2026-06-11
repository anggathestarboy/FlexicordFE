import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  ProfileUpdateApiResponse,
  ProfileUpdateSuccessResponse,
  ProfileUpdateErrorResponse,
} from "./ProfileUpdateType";
import { validateUsername, validateEmail } from "./ProfileUpdateType";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

/**
 * POST /api/profile/update
 *
 * Proxy route untuk update profil user yang sedang login.
 * Meneruskan request ke endpoint backend: POST /auth/profile
 *
 * Request body (multipart/form-data):
 * - username  : string, required, max 12 char, ^[a-zA-Z0-9_]+$
 * - email     : string, required, format email, max 255 char
 * - avatar_url: File | null, optional
 * - bio       : string | null, optional
 *
 * Response:
 * - 200 OK   : { message: string }
 * - 400      : { message: string } – validasi sisi client gagal
 * - 401      : { message: string } – tidak ada token / token invalid
 * - 422      : { message: string, errors: Record<string, string[]> } – validasi backend
 * - 500      : { message: string } – internal error
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ProfileUpdateApiResponse>> {
  try {
    // ── 1. Ambil token dari cookie ──────────────────────────────────────────
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    // ── 2. Baca body (multipart/form-data) ──────────────────────────────────
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: "Request body tidak valid. Gunakan format multipart/form-data." },
        { status: 400 }
      );
    }

    const username = (formData.get("username") as string | null) ?? "";
    const email = (formData.get("email") as string | null) ?? "";
    const bio = formData.get("bio") as string | null;
    const avatarFile = formData.get("avatar_url"); // bisa File atau null

    // ── 3. Validasi sisi client sebelum dikirim ke backend ──────────────────
    const usernameError = validateUsername(username);
    if (usernameError) {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: usernameError },
        { status: 400 }
      );
    }

    const emailError = validateEmail(email);
    if (emailError) {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: emailError },
        { status: 400 }
      );
    }

    // ── 4. Susun FormData yang akan dikirim ke backend ──────────────────────
    const backendForm = new FormData();
    backendForm.append("username", username.trim());
    backendForm.append("email", email.trim());

    // bio: kirim string kosong jika null agar backend bisa reset nilai bio
    if (bio !== null && bio !== undefined) {
      backendForm.append("bio", bio);
    }

    // avatar_url: hanya append jika ada file yang diunggah
    if (avatarFile instanceof File && avatarFile.size > 0) {
      backendForm.append("avatar_url", avatarFile, avatarFile.name);
    }

    // ── 5. Kirim request ke backend ─────────────────────────────────────────
    const backendResponse = await fetch(`${BASE_URL}/auth/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        // Jangan set Content-Type secara manual agar fetch otomatis set boundary
      },
      body: backendForm,
    });

    // ── 6. Parse response backend ───────────────────────────────────────────
    let responseData: Record<string, unknown>;
    try {
      responseData = await backendResponse.json();
    } catch {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: "Response dari server tidak dapat dibaca." },
        { status: 502 }
      );
    }

    // ── 7. Kembalikan response sesuai status backend ─────────────────────────

    // 200 – Sukses
    if (backendResponse.ok) {
      return NextResponse.json<ProfileUpdateSuccessResponse>(
        { message: (responseData.message as string) ?? "Profile akun berhasil diperbarui" },
        { status: 200 }
      );
    }

    // 401 – Unauthorized dari backend
    if (backendResponse.status === 401) {
      return NextResponse.json<ProfileUpdateErrorResponse>(
        { message: (responseData.message as string) ?? "Sesi telah berakhir. Silakan login ulang." },
        { status: 401 }
      );
    }

    // 422 – Validation error dari backend (kembalikan apa adanya)
    if (backendResponse.status === 422) {
      return NextResponse.json(
        {
          message: (responseData.message as string) ?? "Validasi gagal.",
          errors: (responseData.errors as Record<string, string[]>) ?? {},
        },
        { status: 422 }
      );
    }

    // Lainnya – teruskan pesan error dari backend
    return NextResponse.json<ProfileUpdateErrorResponse>(
      {
        message:
          (responseData.message as string) ??
          `Terjadi kesalahan (status ${backendResponse.status}).`,
      },
      { status: backendResponse.status }
    );
  } catch (error: unknown) {
    console.error("[POST /api/profile/update] Unexpected error:", error);

    return NextResponse.json<ProfileUpdateErrorResponse>(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}
