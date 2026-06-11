import axios from "axios";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort_by") ?? "view_count";
    const page = searchParams.get("page") ?? "1";

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/posts?sort_by=${sortBy}&page=${page}`;

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
      {
        success: false,
        message: "Gagal mengirim data",
      },
      {
        status: error.response?.status ?? 500,
      },
    );
  }
}