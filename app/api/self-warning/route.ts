import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SelfWarningResponse } from "./SelfWarningType";

const BASE_URL = "https://pegaduanmasyarakat.alwaysdata.net/api";

export async function GET(request: NextRequest): Promise<NextResponse> {
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

    const response = await fetch(`${BASE_URL}/moderation-logs/user`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data: SelfWarningResponse = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: data.message || "Gagal mengambil data moderation logs.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || "Success get user moderation logs",
      data: data.data || [],
    });
  } catch (error: any) {
    console.error("GET /api/self-warning error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan pada server saat memuat moderation logs.",
      },
      { status: 500 }
    );
  }
}
