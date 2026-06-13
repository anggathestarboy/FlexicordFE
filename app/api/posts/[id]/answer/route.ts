import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { AcceptAnswerRequest, AcceptAnswerResponse } from "./AnswerType";

export async function POST(
  request: NextRequest,
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
        { message: "Post ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const body: AcceptAnswerRequest = await request.json();

    const response = await axios.post<AcceptAnswerResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}/accept-answer`,
      body,
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
      message: response.data.message || "Jawaban berhasil diterima.",
      data: response.data.data,
    });
  } catch (error: any) {
    console.error("ACCEPT ANSWER ERROR:", error.response?.data || error.message);

    const status = error.response?.status || 500;
    const message = error.response?.data?.message || error.message || "Terjadi kesalahan saat menerima jawaban";

    return NextResponse.json(
      { message },
      { status }
    );
  }
}
