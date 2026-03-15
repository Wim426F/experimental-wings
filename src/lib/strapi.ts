const STRAPI_URL = process.env.STRAPI_URL || "http://localhost:1337";

export type StrapiBrand = {
  id: number;
  documentId: string;
  name: string;
  description: string | null;
};

export type StrapiModel = {
  id: number;
  documentId: string;
  name: string;
  configuration: string | null;
  gross_weight: number | null;
  empty_weight: number | null;
  brand: StrapiBrand | null;
};

export type StrapiAircraft = {
  id: number;
  documentId: string;
  registration: string;
  icao_code: string | null;
  serial_number: string | null;
  built_year: number | null;
  story: string | null;
  live_status: Record<string, unknown> | null;
  model: (StrapiModel & { brand: StrapiBrand | null }) | null;
};

async function fetchAll<T>(endpoint: string): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  const pageSize = 100;

  while (true) {
    const sep = endpoint.includes("?") ? "&" : "?";
    const url = `${STRAPI_URL}${endpoint}${sep}pagination[page]=${page}&pagination[pageSize]=${pageSize}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Strapi fetch failed: ${res.status} ${url}`);
    const json = await res.json();
    all.push(...json.data);
    if (page >= json.meta.pagination.pageCount) break;
    page++;
  }

  return all;
}

export async function getBrands(): Promise<StrapiBrand[]> {
  return fetchAll<StrapiBrand>("/api/brands");
}

export async function getModels(): Promise<StrapiModel[]> {
  return fetchAll<StrapiModel>("/api/models?populate=brand");
}

export async function getAircraftList(): Promise<StrapiAircraft[]> {
  return fetchAll<StrapiAircraft>("/api/aircrafts?populate[model][populate]=brand");
}
