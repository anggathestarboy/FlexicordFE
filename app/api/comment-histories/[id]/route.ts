import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CommentHistoriesApiResponse } from "./CommentHistoriesType";

const BASE_URL = "https://pegaduanmasyarakat.alwaysdata.net/api";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Comment ID is required.",
        },
        { status: 400 }
      );
    }

    const response = await fetch(`${BASE_URL}/comment-histories/${id}`, {
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
          message: "Failed to fetch comment histories from external API",
          error: `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result: CommentHistoriesApiResponse = await response.json();

    return NextResponse.json(
      {
        success: true,
        histories: result.histories,
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
