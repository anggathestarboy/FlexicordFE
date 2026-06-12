import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { PostCloseApiResponse, PostCloseResponse } from "./PostCloseType";

// Helper function to extract ID from URL path (/api/posts/[id]/close)
function getIdFromUrl(request: NextRequest): string | undefined {
  const pathname = request.nextUrl.pathname;
  const parts = pathname.split("/");
  return parts[parts.length - 2];
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const id = getIdFromUrl(request);

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    if (!id) {
      return NextResponse.json(
        { message: "ID postingan tidak ditemukan" },
        { status: 400 }
      );
    }

    // Send POST request to external Laravel server
    const response = await axios.post<PostCloseResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}/close`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    return NextResponse.json<PostCloseApiResponse>({
      message: response.data.message || "Postingan berhasil ditutup",
      data: response.data.data,
    });

  } catch (error: any) {
    console.error("POST Close Post API Route Error:", error);

    // Handle error response from backend Laravel server
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<PostCloseApiResponse>(
        { message },
        { status }
      );
    }

    // Handle request timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<PostCloseApiResponse>(
        { message: "Request timeout" },
        { status: 554 }
      );
    }

    return NextResponse.json<PostCloseApiResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
