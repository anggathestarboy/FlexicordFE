import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FollowRequestBody, FollowResponse } from "./FollowType";


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

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

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
