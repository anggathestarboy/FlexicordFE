import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  UserDetailResponse,
  ProfileRouteParams,
  ProfileRouteErrorResponse,
} from "./ProfileType";


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

  // Ambil token dari cookie (sama seperti /api/user)
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    const response = await fetch(
      `${BASE_URL}/detail-user/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          // Prioritaskan cookie token, fallback ke Authorization header dari caller
          ...(token
            ? { Authorization: `Bearer ${token}` }
            : request.headers.get("Authorization")
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