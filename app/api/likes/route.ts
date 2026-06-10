import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

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

    // Parse request body
    const body = await request.json();
    const { target_id } = body;

    if (!target_id) {
      return NextResponse.json(
        { message: "target_id is required" },
        { status: 400 }
      );
    }

    // Kirim request like ke backend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/likes`, // Sesuaikan endpoint backend
      {
        target_id: target_id
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    // Ambil message dari response
    const message = response.data.message || "Success";
    const data = response.data.data;

    return NextResponse.json({
      message: message,
      data: data,
    });

  } catch (error: any) {
    console.error("Like error:", error);

    // Handle error response dari backend
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      if (status === 401) {
        return NextResponse.json(
          { message: "Unauthorized" },
          { status: 401 }
        );
      }

      if (status === 404) {
        return NextResponse.json(
          { message: "Target not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { message: message },
        { status: status }
      );
    }

    // Error network atau timeout
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