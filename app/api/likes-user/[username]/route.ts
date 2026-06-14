import { NextRequest, NextResponse } from "next/server";
import type {
  LikesResponse,
  LikesRouteParams,
  LikesRouteErrorResponse,
} from "./LikesUserType";


import axios from "axios";

// Helper fetch wrapper implemented with axios for backward compatibility
const fetch = async (url: string, options: any = {}) => {
  const response = await axios({
    url,
    method: options.method || "GET",
    headers: options.headers,
    data: options.body ? JSON.parse(options.body) : undefined,
    validateStatus: () => true
  });
  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    json: async () => response.data,
    text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
  };
};

const BASE_URL =
  process.env.API_BASE_URL ?? `${process.env.NEXT_PUBLIC_BASE_URL}`;

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
        cache: "no-store",
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