"use client";
import dynamic from "next/dynamic";

const TrackerMap = dynamic(() => import("./Map"), { ssr: false });

type Aircraft = {
  reg: string;
  lat: number;
  lon: number;
  details: string;
};

export default function MapWrapper({ flying }: { flying: Aircraft[] }) {
  return <TrackerMap flying={flying} />;
}