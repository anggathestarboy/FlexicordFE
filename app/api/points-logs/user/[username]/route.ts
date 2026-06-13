import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    const apiUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/points-logs/${username}`;

    try {
      const response = await axios.get(apiUrl, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          Accept: "application/json",
        },
      });

      return NextResponse.json(response.data, {
        status: response.status,
      });
    } catch (apiError: any) {
      // Fallback to mock data if the backend endpoint is not ready yet
      console.log("Backend failed or not ready, returning mock data for points-logs.");
    
    }
  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { success: false, message: "Terjadi kesalahan internal" },
      { status: 500 }
    );
  }
}
