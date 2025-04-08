import MapWrapper from "./components/MapWrapper";

async function getFlyingData() {
  const res = await fetch("http://localhost:3000/api/flying", { cache: "no-store" });
  return res.json();
}

export default async function Home() {
  const flying = await getFlyingData();
  return <MapWrapper flying={flying} />;
}