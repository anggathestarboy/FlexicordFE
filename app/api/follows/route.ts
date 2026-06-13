import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FollowRequestBody, FollowResponse } from "./FollowType";

const BASE_URL = "https://pegaduanmasyarakat.alwaysdata.net/api";

async function getToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

// POST /api/follows  → follow a user
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body: FollowRequestBody = await req.json();

    if (!body.username || typeof body.username !== "string") {
      return NextResponse.json(
        { message: "Field 'username' is required and must be a string." },
        { status: 400 }
      );
    }

    const externalRes = await fetch(`${BASE_URL}/follow`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: body.username }),
      cache: "no-store",
    });

    const data: FollowResponse = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("[POST /api/follows] Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}

// DELETE /api/follows  → unfollow a user
export async function DELETE(req: NextRequest): Promise<NextResponse> {
  try {
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ message: "Unauthorized. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body: FollowRequestBody = await req.json();

    if (!body.username || typeof body.username !== "string") {
      return NextResponse.json(
        { message: "Field 'username' is required and must be a string." },
        { status: 400 }
      );
    }

    const externalRes = await fetch(`${BASE_URL}/unfollow`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: body.username }),
      cache: "no-store",
    });

    const data = await externalRes.json();

    return NextResponse.json(data, { status: externalRes.status });
  } catch (error) {
    console.error("[DELETE /api/follows] Error:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}
