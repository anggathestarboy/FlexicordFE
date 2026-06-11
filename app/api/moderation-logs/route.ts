import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/moderation-logs`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("GET MODERATION LOGS ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal mengambil log moderasi" },
      { status: error.response?.status || 500 }
    );
  }
}
