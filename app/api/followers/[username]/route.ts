import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FollowersResponse } from "./FollowersType";

const BASE_URL = "https://pegaduanmasyarakat.alwaysdata.net/api";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

// GET /api/followers/[username]  → get followers of a user
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
): Promise<NextResponse> {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { username } = await params;

    if (!username || typeof username !== "string") {
      return NextResponse.json(
        { message: "Path parameter 'username' is required." },
        { status: 400 }
      );
    }

    const externalRes = await fetch(
      `${BASE_URL}/followers/${encodeURIComponent(username)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      }
    );

    const data: FollowersResponse = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("[GET /api/followers/[username]] Error:", error);
    return NextResponse.json(
      { message: "Internal server error." },
      { status: 500 }
    );
  }
}
