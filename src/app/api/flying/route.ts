import { NextResponse } from "next/server";

export async function GET() {
  const mockData = [
    {
      reg: "PH-RVT",
      lat: 52.3,
      lon: 5.6,
      heading: 45,
      alt_baro: 5000,
      gs: 120,
      ias: 110,
      brand: "Vans", // New field
      type: "RV-10", // New field
      details: "Flying",
      lastPosition: {
        lat: 52.31,
        lon: 5.61,
        seen_pos: 10,
      },
    },
    {
      reg: "PH-SMD",
      lat: 52.4,
      lon: 5.7,
      heading: 270,
      alt_baro: 3000,
      gs: 100,
      ias: 95,
      brand: "Sling",
      type: "TSI",
      details: "Flying",
      lastPosition: {
        lat: 52.41,
        lon: 5.71,
        seen_pos: 5,
      },
    },
  ];
  return NextResponse.json(mockData);
}