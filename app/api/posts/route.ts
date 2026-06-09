import axios from "axios";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/posts`,
      
    );

    return NextResponse.json(response.data, {
      status: response.status,
    });
  } catch (error) {
    console.error("GET Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengirim data",
      },
      {
        status: 500,
      }
    );
  }
}