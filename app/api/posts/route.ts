import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get("sort_by") ?? "view_count";
    const page = searchParams.get("page") ?? "1";
    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/posts?sort_by=${sortBy}&page=${page}`;
    const response = await axios.get(apiUrl);
    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengirim data",
      },
      {
        status: 500,
      },
    );
  }
}
