import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function DELETE(request: Request) {
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

    // Kirim request unlike ke backend
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/unlikes`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        data: {
          target_id: target_id,
        },
        timeout: 5000,
      }
    );

    // Ambil message dari response
    const message = response.data.message || "Unliked successfully";

    return NextResponse.json({
      message: message,
    });

  } catch (error: any) {
    console.error("Unlike error:", error);

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
