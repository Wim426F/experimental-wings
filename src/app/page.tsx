import MapWrapper from "./components/MapWrapper";

async function getFlyingData() {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/flying`, { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const flying = await getFlyingData();
  return <MapWrapper flying={flying} />;
}