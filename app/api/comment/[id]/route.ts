import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { EditCommentRequest, CommentDetailApiResponse, DeleteCommentResponse, ApiErrorResponse } from "./CommentDetailType";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Comment ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/comments/${id}`,
      {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("GET Comment API Route Error:", error);

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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Comment ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const body: EditCommentRequest = await request.json();
    const { body: commentBody } = body;

    if (!commentBody) {
      return NextResponse.json(
        { message: "body is required" },
        { status: 400 }
      );
    }

    // Send PUT request to external Laravel server
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/comments/${id}`,
      {
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

    return NextResponse.json<CommentDetailApiResponse>({
      message: response.data.message || "Comment updated successfully",
      data: response.data.data,
      edit_history: response.data.edit_history,
    });

  } catch (error: any) {
    console.error("PUT Comment Edit API Route Error:", error);

    // Handle error response from backend Laravel server
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<CommentDetailApiResponse>(
        { message },
        { status }
      );
    }

    // Handle request timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<CommentDetailApiResponse>(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json<CommentDetailApiResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: Token tidak ditemukan" },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { message: "Comment ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Send DELETE request to external Laravel server
    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/comments/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    return NextResponse.json<DeleteCommentResponse>({
      message: response.data.message || "Comment deleted successfully",
    });

  } catch (error: any) {
    console.error("DELETE Comment API Route Error:", error);

    // Handle error response from backend Laravel server
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<ApiErrorResponse>(
        { message },
        { status }
      );
    }

    // Handle request timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<ApiErrorResponse>(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json<ApiErrorResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
