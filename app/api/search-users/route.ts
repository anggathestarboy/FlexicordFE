import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/search-users`;

    const response = await axios.get(apiUrl, {
      params: { search },
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
      },
      timeout: 5000,
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("Search Users GET error:", error);

    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;
      return NextResponse.json({ message }, { status });
    }

    if (error.code === "ECONNABORTED") {
      return NextResponse.json(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
