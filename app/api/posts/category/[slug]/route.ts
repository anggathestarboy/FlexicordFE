import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

// Helper to extract category slug from URL
function getSlugFromUrl(request: NextRequest): string | undefined {
  const pathname = request.nextUrl.pathname;
  return pathname.split("/").pop();
}

export async function GET(request: NextRequest) {
  try {
    const slug = getSlugFromUrl(request);
    if (!slug) {
      return NextResponse.json(
        { message: "Slug kategori tidak ditemukan" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort_by") ?? "view_count";
    const page = searchParams.get("page") ?? "1";
    const search = searchParams.get("search") ?? "";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const params = new URLSearchParams({ sort_by: sortBy, page });
    if (search) params.set("search", search);

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/posts/category/${slug}?${params.toString()}`;

    const response = await axios.get(apiUrl, {
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
        Accept: "application/json",
      },
    });

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error("GET category posts error:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal mengambil postingan kategori" },
      { status: error.response?.status ?? 500 }
    );
  }
}
