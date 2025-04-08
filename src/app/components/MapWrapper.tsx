"use client";
import dynamic from "next/dynamic";

const TrackerMap = dynamic(() => import("./Map"), { ssr: false });

export default function MapWrapper({ flying }: { flying: any[] }) {
  return <TrackerMap flying={flying} />;
}