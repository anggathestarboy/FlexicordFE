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
        { status: 401 }
      );
    }

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
      { status: 500 }
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

    const body = await request.json();
    const { post_id } = body;

    if (!post_id) {
      return NextResponse.json(
        { message: "post_id is required" },
        { status: 400 }
      );
    }

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
      { status: 500 }
    );
  }
}