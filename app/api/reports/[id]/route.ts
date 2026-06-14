import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ReportResolveRequest, ReportResolveResponse } from "../ReportsType";


import axios from "axios";

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

const BASE_URL = `${process.env.NEXT_PUBLIC_BASE_URL}`;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ReportResolveResponse>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "Report ID is required",
        },
        { status: 400 }
      );
    }

    let body: ReportResolveRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON body",
        },
        { status: 400 }
      );
    }

    const { status } = body;
    const allowedStatuses = ["resolved", "dismissed", "reviewed", "pending"];
    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status. Allowed values are: ${allowedStatuses.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const externalApiUrl = `${BASE_URL}/reports-resolve/${id}`;
    const response = await fetch(externalApiUrl, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (response.status === 401) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized or invalid session",
        },
        { status: 401 }
      );
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        {
          success: false,
          message: "Failed to resolve report on the external API",
          error: `External API returned status ${response.status}: ${errorText}`,
        },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json(
      {
        success: true,
        message: result.message || "Report status updated successfully",
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
