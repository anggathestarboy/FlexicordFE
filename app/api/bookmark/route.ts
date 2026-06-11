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
        { status: 401 }
      );
    }

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
      { status: 500 }
    );
  }
}

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
        { status: 401 }
      );
    }

    const body = await request.json();

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
        { status: 400 }
      );
    }

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
      { status: 500 }
    );
  }
}