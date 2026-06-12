import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const EXTERNAL_API_URL = "https://pegaduanmasyarakat.alwaysdata.net/api/notifications/read-all";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
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

    const response = await fetch(EXTERNAL_API_URL, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
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
          message: result.message || "Gagal menandai semua notifikasi sebagai terbaca.",
          error: result.error || `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        status: result.status || "success",
        message: result.message || "All notifications marked as read",
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
