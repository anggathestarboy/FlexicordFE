import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Bookmark ID is required" },
        { status: 400 }
      );
    }

    // Kirim request unbookmark ke backend
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/bookmarks/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    // Ambil message dari response
    const message = response.data.message || "Bookmark removed successfully";

    return NextResponse.json({
      message: message,
    });

  } catch (error: any) {
    console.error("Unbookmark error:", error);

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
          { message: "Bookmark not found" },
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
