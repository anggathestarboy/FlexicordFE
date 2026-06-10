import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { TagDetailResponse, TagsResponse } from "./TagType";

// ===============================
// GET ALL TAGS
// ===============================
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const response = await axios.get<TagsResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tags`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("GET TAGS ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal mengambil tags" },
      { status: error.response?.status || 500 }
    );
  }
}

// ===============================
// CREATE TAG
// ===============================
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await axios.post<TagDetailResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/tags`,
      body,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("CREATE TAG ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal membuat tag" },
      { status: error.response?.status || 500 }
    );
  }
}