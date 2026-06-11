import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// ===================================
// GET ID FROM URL
// ===================================
function getIdFromUrl(request: NextRequest): string | undefined {
  const pathname = request.nextUrl.pathname;
  return pathname.split("/").pop();
}

// ===================================
// UPDATE BADGE (POST proxy for PUT spoofing)
// ===================================
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

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/badges/${id}`,
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
    console.error("UPDATE BADGE ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal memperbarui badge" },
      { status: error.response?.status || 500 }
    );
  }
}

// ===================================
// DELETE BADGE
// ===================================
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
      `${process.env.NEXT_PUBLIC_BASE_URL}/badges/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("DELETE BADGE ERROR:", error.response?.data || error.message);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal menghapus badge" },
      { status: error.response?.status || 500 }
    );
  }
}
