import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { DownvoteRequest, DownvoteApiResponse } from "./DownvoteType";

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
    const body: DownvoteRequest = await request.json();
    const { target_id } = body;

    if (!target_id) {
      return NextResponse.json(
        { message: "target_id is required" },
        { status: 400 }
      );
    }

    // Kirim request ke backend Laravel
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/downvotes`,
      {
        target_id,
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

    const message = response.data.message || "Downvote updated successfully";
    const responseData = response.data;

    return NextResponse.json<DownvoteApiResponse>({
      message: message,
      data: responseData.data,
      action: responseData.action,
      vote_score: responseData.vote_score,
    });

  } catch (error: any) {
    console.error("Downvote API Route Error:", error);

    // Handle error response dari backend
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<DownvoteApiResponse>(
        { message },
        { status }
      );
    }

    // Error network atau timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<DownvoteApiResponse>(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json<DownvoteApiResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
