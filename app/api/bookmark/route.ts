<<<<<<< HEAD
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
=======
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import type {
  BookmarksApiResponse,
  BookmarkApiResponse,
  BookmarksResponse,
  BookmarkSingleResponse,
  ApiErrorResponse,
} from "./BookmarkType";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

// ============================================================
// Helper: ambil token dari cookies & validasi
// ============================================================
async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("token")?.value ?? null;
}

// ============================================================
// GET /api/bookmarks
// ============================================================
export async function GET(
  request: NextRequest
): Promise<NextResponse<BookmarksApiResponse>> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" } as ApiErrorResponse,
>>>>>>> profile
        { status: 401 }
      );
    }

<<<<<<< HEAD
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bookmarks`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    return NextResponse.json({
      message: response.data.message || "Success",
      data: response.data.data,
    });

  } catch (error: any) {
    console.error("Bookmark GET error:", error);

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
=======
    const { searchParams } = new URL(request.url);
    const queryString = searchParams.toString();
    const url = `${BASE_URL}/bookmarks${queryString ? `?${queryString}` : ""}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json().catch(() => ({
        message: "Failed to fetch bookmarks",
      }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data: BookmarksResponse = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[GET /api/bookmarks] Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      } as ApiErrorResponse,
>>>>>>> profile
      { status: 500 }
    );
  }
}

<<<<<<< HEAD
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
=======
// ============================================================
// POST /api/bookmarks
// ============================================================
export async function POST(
  request: NextRequest
): Promise<NextResponse<BookmarkApiResponse>> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" } as ApiErrorResponse,
>>>>>>> profile
        { status: 401 }
      );
    }

    const body = await request.json();
<<<<<<< HEAD
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json(
        { message: "post_id is required" },
=======

    const res = await fetch(`${BASE_URL}/bookmarks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json().catch(() => ({
        message: "Failed to create bookmark",
      }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data: BookmarkSingleResponse = await res.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("[POST /api/bookmarks] Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      } as ApiErrorResponse,
      { status: 500 }
    );
  }
}

// ============================================================
// DELETE /api/bookmarks?id=xxx
// ============================================================
export async function DELETE(
  request: NextRequest
): Promise<NextResponse<BookmarkApiResponse | ApiErrorResponse>> {
  try {
    const token = await getAuthToken();

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" } as ApiErrorResponse,
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { message: "Bookmark ID is required" } as ApiErrorResponse,
>>>>>>> profile
        { status: 400 }
      );
    }

<<<<<<< HEAD
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bookmarks`,
      { post_id },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    return NextResponse.json({
      message: response.data.message || "Success",
      data: response.data.data,
    });

  } catch (error: any) {
    console.error("Bookmark POST error:", error);

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
=======
    const res = await fetch(`${BASE_URL}/bookmarks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData: ApiErrorResponse = await res.json().catch(() => ({
        message: "Failed to delete bookmark",
      }));
      return NextResponse.json(errorData, { status: res.status });
    }

    const data: BookmarkSingleResponse = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("[DELETE /api/bookmarks] Error:", error);
    return NextResponse.json(
      {
        message: "Internal Server Error",
        error: error instanceof Error ? error.message : "Unknown error",
      } as ApiErrorResponse,
>>>>>>> profile
      { status: 500 }
    );
  }
}