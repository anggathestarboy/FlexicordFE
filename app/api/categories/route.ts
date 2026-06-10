import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import { CategoriesResponse } from "./CategoryType";

// ===============================
// GET ALL CATEGORIES
// ===============================
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    const response = await axios.get<CategoriesResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.log("GET CATEGORIES ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal mengambil categories" },
      { status: error.response?.status || 500 }
    );
  }
}

// ===============================
// CREATE CATEGORY
// ===============================
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const response = await axios.post<CategoriesResponse>(
      `${process.env.NEXT_PUBLIC_BASE_URL}/categories`,
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
    console.log("CREATE CATEGORY ERROR:", error.response?.data);

    return NextResponse.json(
      { message: error.response?.data?.message || "Gagal membuat category" },
      { status: error.response?.status || 500 }
    );
  }
}