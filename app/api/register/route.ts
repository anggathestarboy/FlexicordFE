import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Body sudah berisi { username, password } dari frontend
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
      body,  // Langsung kirim body apa adanya
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    // Buat response dengan data yang sesuai
   const res = NextResponse.json({
  message: response.data.message,
  token: response.data.token
});

    // Set cookie untuk token
    res.cookies.set("token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return res;

  } catch (error: any) {
    console.error('Register error:', error);
    
    // Handle timeout error
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { message: "Waktu koneksi habis. Silakan coba lagi" },
        { status: 408 }
      );
    }
    
    // Handle network error
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server backend" },
        { status: 503 }
      );
    }
    
    // Handle response error dari backend
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      // Kirimkan message dari backend jika ada
      const errorMessage = data.message || "Register gagal";
      
      return NextResponse.json(
        { 
          message: errorMessage,
          errors: data.errors || null
        },
        { status: status }
      );
    }
    
    // Default error
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}