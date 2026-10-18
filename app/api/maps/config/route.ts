import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { statusCode: 401, message: "Unauthorized" },
      { status: 401 },
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY?.trim();

  if (!apiKey) {
    return NextResponse.json(
      { message: "Google Maps API key is not configured on the server." },
      { status: 500 },
    );
  }

  return NextResponse.json({ apiKey });
}
