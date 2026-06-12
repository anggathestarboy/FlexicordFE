import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { WarningRequest, WarningResponse } from "./WarningType";

const BASE_URL = "https://pegaduanmasyarakat.alwaysdata.net/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse> {
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

    const { username } = await params;
    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is required.",
        },
        { status: 400 }
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

    const { reason, notes } = body as WarningRequest;

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan (reason) wajib diisi.",
        },
        { status: 400 }
      );
    }

    if (reason.length > 255) {
      return NextResponse.json(
        {
          success: false,
          message: "Alasan (reason) tidak boleh melebihi 255 karakter.",
        },
        { status: 400 }
      );
    }

    if (notes !== undefined && notes !== null) {
      if (typeof notes !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "Catatan (notes) harus berupa string atau null.",
          },
          { status: 400 }
        );
      }
      if (notes.length > 500) {
        return NextResponse.json(
          {
            success: false,
            message: "Catatan (notes) tidak boleh melebihi 500 karakter.",
          },
          { status: 400 }
        );
      }
    }

    const response = await fetch(`${BASE_URL}/warnings/${encodeURIComponent(username)}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        reason,
        notes: notes || null,
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

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Gagal memberikan warning.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "Warning telah diberikan kepada user",
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
