import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { CreatePostRequest, CreatePostResponse } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort_by") ?? "view_count";
    const page = searchParams.get("page") ?? "1";
    const search = searchParams.get("search") ?? "";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const params = new URLSearchParams({ sort_by: sortBy, page });
    if (search) params.set("search", search);

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/posts?${params.toString()}`;

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
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Gagal mengirim data" },
      { status: error.response?.status ?? 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: CreatePostRequest = await request.json();

    if (!body.title || !body.body || !body.category_slug) {
      return NextResponse.json(
        { message: "Title, body, dan category_slug wajib diisi" },
        { status: 400 }
      );
    }

    const response = await axios.post<CreatePostResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts`,
      body,
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
      message: response.data.message || "Postingan berhasil dibuat",
      data: response.data.data,
    });
  } catch (error: any) {
    console.error("CREATE POST ERROR:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat membuat postingan";

    return NextResponse.json(
      { message },
      { status }
    );
  }
}