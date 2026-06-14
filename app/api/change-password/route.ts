import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";


import axios from "axios";

// Helper fetch wrapper implemented with axios for backward compatibility
const fetch = async (url: string, options: any = {}) => {
  const response = await axios({
    url,
    method: options.method || "GET",
    headers: options.headers,
    data: options.body ? JSON.parse(options.body) : undefined,
    validateStatus: () => true
  });
  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    json: async () => response.data,
    text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
  };
};

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Silakan login terlebih dahulu.",
        },
        { status: 401 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    const { current_password, new_password, new_password_confirmation } = body;

    // Input Validation
    if (!current_password || typeof current_password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Password saat ini (current_password) wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (!new_password || typeof new_password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru (new_password) wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password baru minimal harus 6 karakter.",
        },
        { status: 400 }
      );
    }

    if (!new_password_confirmation || typeof new_password_confirmation !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Konfirmasi password baru (new_password_confirmation) wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (new_password !== new_password_confirmation) {
      return NextResponse.json(
        {
          success: false,
          message: "Konfirmasi password baru tidak cocok dengan password baru.",
        },
        { status: 400 }
      );
    }

    // Forward request to external API
    const response = await fetch(`${BASE_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        current_password,
        new_password,
        new_password_confirmation,
      }),
    });

    if (response.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Sesi Anda telah berakhir. Silakan login ulang.",
        },
        { status: 401 }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Gagal mengubah password.",
          error: result.error || `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "Password berhasil diubah.",
        data: result.data,
      },
      { status: response.status }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
