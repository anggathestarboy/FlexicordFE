import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // Forward request to external API
    const response = await fetch(`${BASE_URL}/admin/promote-moderator/${encodeURIComponent(username)}`, {
      method: "POST",
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
          message: result.message || "Gagal mempromosikan user menjadi moderator.",
          error: result.error || `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "User telah dipromosikan menjadi moderator",
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
