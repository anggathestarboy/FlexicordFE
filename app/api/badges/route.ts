import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import type { BadgesApiResponse, BadgesResponse } from "./BadgesType";




// Helper fetch wrapper implemented with axios for backward compatibility
const fetch = async (url: string, options: any = {}) => {
  const response = await axios({
    url,
    method: options.method || "GET",
    headers: options.headers,
    data: options.body ? JSON.parse(options.body) : undefined,
    validateStatus: () => true
  });
  return {
    status: response.status,
    ok: response.status >= 200 && response.status < 300,
    json: async () => response.data,
    text: async () => typeof response.data === 'string' ? response.data : JSON.stringify(response.data)
  };
};

const EXTERNAL_API_URL = process.env.NEXT_PUBLIC_BASE_URL;

console.log(EXTERNAL_API_URL)

export async function GET(request: NextRequest): Promise<NextResponse<BadgesResponse>> {
  try {
    const response = await fetch(`${EXTERNAL_API_URL}/badges`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch badges from external API",
          error: `External API returned status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const result: BadgesApiResponse = await response.json();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          message: "External API returned unsuccessful response",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: result.data,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();

    const response = await axios.post(
      `${EXTERNAL_API_URL}/badges`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("CREATE BADGE ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal membuat badge" },
      { status: error.response?.status || 500 }
    );
  }
}