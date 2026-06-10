import { NextRequest, NextResponse } from "next/server";
import type {
  LikesResponse,
  LikesRouteParams,
  LikesRouteErrorResponse,
} from "./LikesUserType";

const BASE_URL =
  process.env.API_BASE_URL ?? "https://pegaduanmasyarakat.alwaysdata.net/api";

export async function GET(
  request: NextRequest,
  { params }: LikesRouteParams
): Promise<NextResponse<LikesResponse | LikesRouteErrorResponse>> {
  const { username } = await params;

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${BASE_URL}/likes/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(request.headers.get("Authorization")
            ? { Authorization: request.headers.get("Authorization")! }
            : {}),
        },
        next: { revalidate: 60 },
      }
    );

    if (response.status === 404) {
      return NextResponse.json(
        { error: "User not found.", status: 404 },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(`[likes route] upstream error ${response.status}: ${text}`);
      return NextResponse.json(
        { error: "Failed to fetch likes.", status: response.status },
        { status: response.status }
      );
    }

    const data: LikesResponse = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[likes route] unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}