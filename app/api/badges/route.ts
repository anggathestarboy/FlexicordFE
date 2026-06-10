import { NextRequest, NextResponse } from "next/server";
import type { BadgesApiResponse, BadgesResponse } from "./BadgesType";

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_BASE_URL;

console.log(EXTERNAL_API_URL)

export async function GET(request: NextRequest): Promise<NextResponse<BadgesResponse>> {
  try {
    const response = await fetch(`${EXTERNAL_API_URL}/badges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      // Revalidate cache every 60 seconds (optional, adjust as needed)
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch badges from external API",
          error: `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result: BadgesApiResponse = await response.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "External API returned unsuccessful response",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
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