import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReportsApiResponse, ReportsResponse } from "./ReportsType";

const EXTERNAL_API_URL = "https://pegaduanmasyarakat.alwaysdata.net/api/reports";

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

export async function POST(request: NextRequest): Promise<NextResponse> {
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

    const { target_id, reason, description } = body;

    if (!target_id || typeof target_id !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "target_id is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (!reason || typeof reason !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "reason is required and must be a string",
        },
        { status: 400 }
      );
    }

    if (description !== undefined && description !== null) {
      if (typeof description !== "string") {
        return NextResponse.json(
          {
            success: false,
            message: "description must be a string or null",
          },
          { status: 400 }
        );
      }
      if (description.length > 500) {
        return NextResponse.json(
          {
            success: false,
            message: "description must not exceed 500 characters",
          },
          { status: 400 }
        );
      }
    }

    const response = await fetch("https://pegaduanmasyarakat.alwaysdata.net/api/reports", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });

    if (response.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized or invalid session",
        },
        { status: 401 }
      );
    }

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: result.message || "Failed to submit report to external API",
          error: result.error || `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message || "Report submitted successfully",
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