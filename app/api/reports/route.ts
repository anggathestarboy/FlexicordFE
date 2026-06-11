import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReportsApiResponse, ReportsResponse } from "./ReportsType";

const EXTERNAL_API_URL = "https://pegaduanmasyarakat.alwaysdata.net/api/reports-all";

export async function GET(request: NextRequest): Promise<NextResponse<ReportsResponse>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = searchParams.get("page") ?? "1";
    const perPage = searchParams.get("per_page");

    const params = new URLSearchParams({ page });
    if (perPage) params.set("per_page", perPage);

    const response = await fetch(`${EXTERNAL_API_URL}?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 0 },
    });

    if (response.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch reports from external API",
          error: `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result: ReportsApiResponse = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data,
      },
      { status: 200 }
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