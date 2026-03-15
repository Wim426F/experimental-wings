import { NextResponse } from "next/server";

const STRAPI_URL = process.env.STRAPI_URL || "http://127.0.0.1:1337";

export async function GET() {
  try {
    const url =
      `${STRAPI_URL}/api/aircrafts` +
      `?filters[live_status][$notNull]=true` +
      `&populate[model][populate]=brand` +
      `&pagination[pageSize]=100`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json([]);
    }

    const json = await res.json();
    const now = Math.floor(Date.now() / 1000);

    const flying = json.data
      .filter((a: Record<string, unknown>) => {
        const ls = a.live_status as Record<string, number> | null;
        return ls && now - ls.seen <= 120;
      })
      .map((a: Record<string, unknown>) => {
        const ls = a.live_status as Record<string, number>;
        const model = a.model as Record<string, unknown> | null;
        const brand = model?.brand as Record<string, unknown> | null;
        return {
          reg: a.registration,
          lat: ls.lat,
          lon: ls.lon,
          heading: ls.track ?? 0,
          alt_baro: ls.alt_baro ?? 0,
          gs: ls.gs ?? 0,
          ias: ls.ias ?? 0,
          brand: brand?.name ?? "Unknown",
          type: model?.name ?? "Unknown",
          details: "Flying",
          lastPosition: { lat: ls.lat, lon: ls.lon, seen_pos: ls.seen },
        };
      });

    return NextResponse.json(flying);
  } catch {
    return NextResponse.json([]);
  }
}
