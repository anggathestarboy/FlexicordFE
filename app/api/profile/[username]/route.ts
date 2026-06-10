import { NextRequest, NextResponse } from "next/server";
import type {
  UserDetailResponse,
  ProfileRouteParams,
  ProfileRouteErrorResponse,
} from "./ProfileType";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export async function GET(
  request: NextRequest,
  { params }: ProfileRouteParams
): Promise<NextResponse<UserDetailResponse | ProfileRouteErrorResponse>> {
  const { username } = await params;

  if (!username || typeof username !== "string") {
    return NextResponse.json(
      { error: "Username is required." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(`${BASE_URL}/detail-user/${encodeURIComponent(username)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        // Forward Authorization header if provided by the caller (e.g. for private profiles)
        ...(request.headers.get("Authorization")
          ? { Authorization: request.headers.get("Authorization")! }
          : {}),
      },
      // Revalidate at most once every 60 seconds (Next.js cache)
      next: { revalidate: 60 },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: "User not found.", status: 404 },
        { status: 404 }
      );
    }

    if (!response.ok) {
      const text = await response.text();
      console.error(`[profile route] upstream error ${response.status}: ${text}`);
      return NextResponse.json(
        { error: "Failed to fetch user profile.", status: response.status },
        { status: response.status }
      );
    }

    const data: UserDetailResponse = await response.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[profile route] unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}