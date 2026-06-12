import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { CommentRequest, CommentApiResponse } from "./CommentType";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CommentRequest = await request.json();
    const { post_id, parent_id, body: commentBody } = body;

    if (!post_id) {
      return NextResponse.json(
        { message: "post_id is required" },
        { status: 400 }
      );
    }

    if (!commentBody) {
      return NextResponse.json(
        { message: "body is required" },
        { status: 400 }
      );
    }

    // Kirim request ke backend Laravel
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/comments`,
      {
        post_id,
        parent_id: parent_id ?? null,
        body: commentBody,
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

    const message = response.data.message || "Comment created successfully";
    const responseData = response.data;

    return NextResponse.json<CommentApiResponse>({
      message: message,
      data: responseData.data,
    });

  } catch (error: any) {
    console.error("Comment API Route Error:", error);

    // Handle error response dari backend
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<CommentApiResponse>(
        { message },
        { status }
      );
    }

    // Error network atau timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<CommentApiResponse>(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json<CommentApiResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
