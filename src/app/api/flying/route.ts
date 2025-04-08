import { NextResponse } from "next/server";

export async function GET() {
  const mockData = [
    { reg: "PH-RVT", lat: 52.3, lon: 5.6, details: "Flying" },
    { reg: "PH-SMD", lat: 52.4, lon: 5.7, details: "Flying" },
  ];
  return NextResponse.json(mockData);
}