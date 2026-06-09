import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  try {
    if (token) {
      await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          withCredentials: true,
        }
      );

      
    }
  } catch (error: any) {
    console.log("jwt logout error:", error.response?.data || error.message);
  }

  // Hapus cookie token di Next.js
  const response = NextResponse.json({ message: "Logout berhasil" });

  response.cookies.set("token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
  });

  return response;
}