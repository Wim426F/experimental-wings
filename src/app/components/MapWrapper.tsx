"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

const TrackerMap = dynamic(() => import("./Map"), { ssr: false });

type Aircraft = {
  reg: string;
  lat: number;
  lon: number;
  heading: number;
  alt_baro: number;
  gs: number;
  ias: number;
  brand: string;
  type: string;
  details: string;
  lastPosition: {
    lat: number;
    lon: number;
    seen_pos: number;
  };
};

// Mock past flights data
const pastFlights = [
  { reg: "PH-XYZ", brand: "Vans", type: "RV-8", takeoff: "Schiphol", landing: "Rotterdam", time: "2 hours ago" },
  { reg: "PH-ABC", brand: "Sonex", type: "Sonex", takeoff: "Eindhoven", landing: "Utrecht", time: "5 hours ago" },
];

export default function MapWrapper({ flying }: { flying: Aircraft[] }) {
  const [sidebarContent, setSidebarContent] = useState<"default" | "reg" | "brand" | "type">("default");
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  const handleRegClick = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setSidebarContent("reg");
  };

  const handleBrandClick = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setSidebarContent("brand");
  };

  const handleTypeClick = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setSidebarContent("type");
  };

  const handleBack = () => {
    setSidebarContent("default");
    setSelectedAircraft(null);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="w-2/3">
        <TrackerMap
          flying={flying}
          onRegClick={handleRegClick}
          onBrandClick={handleBrandClick}
          onTypeClick={handleTypeClick}
        />
      </div>
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto border-l-2 border-gray-300">
        {sidebarContent === "default" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Welcome to Experimental Wings</h2>
            <p className="mb-4">Track experimental airplanes in your region and explore their flight history.</p>
            <h3 className="text-lg font-semibold mb-2">Recent Flights</h3>
            <ul className="space-y-2">
              {pastFlights.map((flight, index) => (
                <li
                  key={index}
                  className="relative bg-gray-50 p-2 rounded-md shadow-sm border border-gray-300"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-medium text-sm">{flight.reg}</span>
                    <span className="text-xs text-gray-600">{flight.time}</span>
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-700">
                    <span>Took off from: {flight.takeoff}</span>
                    <span>Landed in: {flight.landing}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {sidebarContent === "reg" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAircraft.reg}</h2>
              <button onClick={handleBack} className="text-sky-800 hover:underline">Back</button>
            </div>
            <p><strong>Photos & Flight History:</strong></p>
            <p>View detailed info for {selectedAircraft.reg} (e.g., on Planespotters.net or FlightAware).</p>
            {/* Add real links or API data later */}
          </div>
        )}
        {sidebarContent === "brand" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAircraft.brand}</h2>
              <button onClick={handleBack} className="text-sky-800 hover:underline">Back</button>
            </div>
            <p><strong>Learn More:</strong></p>
            <p>
              Explore {selectedAircraft.brand} on{" "}
              <a
                href={`https://en.wikipedia.org/wiki/${selectedAircraft.brand}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-800 hover:underline"
              >
                Wikipedia
              </a>.
            </p>
          </div>
        )}
        {sidebarContent === "type" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{selectedAircraft.brand} {selectedAircraft.type}</h2>
              <button onClick={handleBack} className="text-sky-800 hover:underline">Back</button>
            </div>
            <p><strong>Learn More:</strong></p>
            <p>
              Explore the {selectedAircraft.brand} {selectedAircraft.type} on{" "}
              <a
                href={`https://en.wikipedia.org/wiki/${selectedAircraft.brand}_${selectedAircraft.type}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sky-800 hover:underline"
              >
                Wikipedia
              </a>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}