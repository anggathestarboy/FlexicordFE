import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { VoteRequest, VoteApiResponse } from "./VoteType";

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
    const body: VoteRequest = await request.json();
    const { target_id, vote_type } = body;

    if (!target_id) {
      return NextResponse.json(
        { message: "target_id is required" },
        { status: 400 }
      );
    }

    if (!vote_type) {
      return NextResponse.json(
        { message: "vote_type is required" },
        { status: 400 }
      );
    }

    // Kirim request ke backend Laravel
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/votes`,
      {
        target_id,
        vote_type,
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

    const message = response.data.message || "Vote updated successfully";
    const responseData = response.data;

    return NextResponse.json<VoteApiResponse>({
      message: message,
      data: responseData.data,
      action: responseData.action,
      vote_score: responseData.vote_score,
    });

  } catch (error: any) {
    console.error("Vote API Route Error:", error);

    // Handle error response dari backend
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || error.message;

      return NextResponse.json<VoteApiResponse>(
        { message },
        { status }
      );
    }

    // Error network atau timeout
    if (error.code === "ECONNABORTED") {
      return NextResponse.json<VoteApiResponse>(
        { message: "Request timeout" },
        { status: 504 }
      );
    }

    return NextResponse.json<VoteApiResponse>(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
