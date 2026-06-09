import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import axios from "axios";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verifikasi token ke backend
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        timeout: 5000,
      }
    );

    // Format user data sama seperti di login
    const userData = response.data.user || response.data;
    
    // Perhatikan: backend mengirim "role" bukan "roles"
    const userRoles = userData.role || userData.roles || [];
    
    const getHighestPriorityRole = (roles: any[]) => {
      if (!roles || roles.length === 0) return { name: 'user' };
      
      // Urutan prioritas role (dari tertinggi ke terendah)
      const priorityOrder = ['admin', 'moderator', 'user'];
      
      // Cari role dengan prioritas tertinggi
      for (const priorityRole of priorityOrder) {
        const foundRole = roles.find(role => 
          role.name?.toLowerCase() === priorityRole
        );
        if (foundRole) {
          // Parse permissions jika berupa string JSON
          if (foundRole.permissions && typeof foundRole.permissions === 'string' && foundRole.permissions !== 'null') {
            try {
              foundRole.parsedPermissions = JSON.parse(foundRole.permissions);
            } catch (e) {
              console.error('Error parsing permissions:', e);
            }
          }
          return foundRole;
        }
      }
      
      // Default ke role pertama jika tidak ada yang match
      return roles[0];
    };

    const highestRole = getHighestPriorityRole(userRoles);

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
      roles: userRoles, // Simpan semua roles dengan key yang konsisten
      primary_role: highestRole,
    };

    console.log('Formatted user:', {
      username: formattedUser.username,
      primary_role: formattedUser.primary_role,
      all_roles: userRoles.map((r: { name: string }) => r.name)
    });

    return NextResponse.json({
      message: "Authenticated",
      user: formattedUser,
    });

  } catch (error: any) {
    console.error("Auth check error:", error);
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}