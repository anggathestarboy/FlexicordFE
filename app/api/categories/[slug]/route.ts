import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

// Helper to extract slug from request URL
function getSlugFromUrl(request: NextRequest): string | undefined {
  const pathname = request.nextUrl.pathname;
  return pathname.split("/").pop();
}







// ===================================
// UPDATE CATEGORY
// ===================================
export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const slug = getSlugFromUrl(request);

    

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Slug tidak ditemukan" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}`,
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
    console.error("UPDATE CATEGORY ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal memperbarui kategori" },
      { status: error.response?.status || 500 }
    );
  }
}

// ===================================
// DELETE CATEGORY
// ===================================
export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    const slug = getSlugFromUrl(request);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!slug) {
      return NextResponse.json(
        { message: "Slug tidak ditemukan" },
        { status: 400 }
      );
    }

    const response = await axios.delete(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("DELETE CATEGORY ERROR:", error.response?.data || error.message);
    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal menghapus kategori" },
      { status: error.response?.status || 500 }
    );
  }
}
