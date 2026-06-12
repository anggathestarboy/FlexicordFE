import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";
import { PostDetailResponse, EditPostRequest, EditPostResponse } from "./PostDetailType";

// ===============================
// FUNCTION UNTUK AMBIL ID DARI URL
// ===============================
function getIdFromUrl(request: NextRequest): string | undefined {
  const pathname = request.nextUrl.pathname;
  return pathname.split("/").pop();
}

// ===============================
// GET DETAIL POST
// ===============================
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const id = getIdFromUrl(request);

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const response = await axios.get<PostDetailResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("GET DETAIL POST ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Post tidak ditemukan" },
      { status: error.response?.status || 500 }
    );
  }
}

// ===============================
// UPDATE POST
// ===============================
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const id = getIdFromUrl(request);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const formData = await request.formData();

    const response = await axios.post<PostDetailResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}?_method=PUT`,
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
    console.log("UPDATE POST ERROR:", error.response?.data);

    return NextResponse.json(
      {
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengupdate post",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// ===============================
// EDIT POST (PUT)
// ===============================
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    const id = getIdFromUrl(request);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const body: EditPostRequest = await request.json();

    const response = await axios.put<EditPostResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}`,
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
      message: response.data.message || "post berhasil diperbarui",
      data: response.data.data,
      edit_history: response.data.edit_history,
    });
  } catch (error: any) {
    console.error("EDIT POST ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      {
        message:
          error.response?.data?.message ||
          "Terjadi kesalahan saat mengupdate post",
      },
      { status: error.response?.status || 500 }
    );
  }
}

// ===============================
// DELETE POST
// ===============================
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const id = getIdFromUrl(request);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json(
        { message: "ID tidak ditemukan" },
        { status: 400 }
      );
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("DELETE POST ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Post tidak ditemukan" },
      { status: error.response?.status || 500 }
    );
  }
}