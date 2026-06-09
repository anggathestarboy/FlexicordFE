import { NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login`,
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 10000
      }
    );

    // Fungsi untuk menentukan role prioritas
    const getHighestPriorityRole = (roles: any[]) => {
      if (!roles || roles.length === 0) return { name: 'user' };
      
      // Urutan prioritas role (dari tertinggi ke terendah)
      const priorityOrder = ['admin', 'moderator', 'user'];
      
      // Cari role dengan prioritas tertinggi
      for (const priorityRole of priorityOrder) {
        const foundRole = roles.find(role => 
          role.name?.toLowerCase() === priorityRole
        );
        if (foundRole) return foundRole;
      }
      
      // Default ke role pertama jika tidak ada yang match
      return roles[0];
    };

    const userData = response.data.user;
    const highestRole = getHighestPriorityRole(userData.roles);

    // Format ulang user data dengan role prioritas
    const formattedUser = {
      id: userData.id,
      username: userData.username,
      email: userData.email,
      avatar_url: userData.avatar_url,
      bio: userData.bio,
      reputation_points: userData.reputation_points,
      level: userData.level,
      is_banned: userData.is_banned,
      created_at: userData.created_at,
      updated_at: userData.updated_at,
      roles: userData.roles, // Simpan semua roles
      primary_role: highestRole, // Role dengan prioritas tertinggi
      permissions: highestRole.permissions ? JSON.parse(highestRole.permissions) : null
    };

    // Buat response dengan data yang sudah diformat
    const res = NextResponse.json({
      message: response.data.message,
      token: response.data.token,
      user: formattedUser
    });

    // Set cookie untuk token
    res.cookies.set("token", response.data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30 * 6,
    });

    return res;

  } catch (error: any) {
    console.error('Login error:', error);
    
    if (error.code === 'ECONNABORTED') {
      return NextResponse.json(
        { message: "Waktu koneksi habis. Silakan coba lagi" },
        { status: 408 }
      );
    }
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json(
        { message: "Tidak dapat terhubung ke server backend" },
        { status: 503 }
      );
    }
    
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      
      const errorMessage = data.message || "Login gagal";
      
      return NextResponse.json(
        { 
          message: errorMessage,
          errors: data.errors || null
        },
        { status: status }
      );
    }
    
    return NextResponse.json(
      { message: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}