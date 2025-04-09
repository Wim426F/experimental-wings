"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const createAirplaneIcon = (heading: number) =>
  new L.DivIcon({
    html: `
      <img
        src="/airplane-icon.png"
        style="width: 32px; height: 32px; transform: rotate(${heading}deg); transform-origin: center;"
      />
    `,
    className: "",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });

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

export default function TrackerMap({
  flying,
  onRegClick,
  onBrandClick,
  onTypeClick,
}: {
  flying: Aircraft[];
  onRegClick: (aircraft: Aircraft) => void;
  onBrandClick: (aircraft: Aircraft) => void;
  onTypeClick: (aircraft: Aircraft) => void;
}) {
  return (
    <MapContainer center={[52.2958, 5.6177]} zoom={8} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {flying.map((aircraft) => (
        <Marker
          key={aircraft.reg}
          position={[aircraft.lat, aircraft.lon]}
          icon={createAirplaneIcon(aircraft.heading)}
        >
          <Popup>
            <div>
              <h3 className="text-lg font-semibold">
                <button onClick={() => onRegClick(aircraft)} className="text-sky-800 hover:underline">
                  {aircraft.reg}
                </button>
              </h3>
              <p className="text-sm">
                <span className="text-gray-600">Brand:</span>{" "}
                <button onClick={() => onBrandClick(aircraft)} className="text-sky-800 hover:underline">
                  {aircraft.brand}
                </button>{" "}
                <span className="text-gray-600">Type:</span>{" "}
                <button onClick={() => onTypeClick(aircraft)} className="text-sky-800 hover:underline">
                  {aircraft.type}
                </button>
              </p>
              <p className="text-sm"><span className="text-gray-600">Status:</span> {aircraft.details}</p>
              <p className="text-sm"><span className="text-gray-600">Altitude:</span> {aircraft.alt_baro} ft &nbsp;({Math.round(aircraft.alt_baro / 3.28)}&nbsp;m)</p>
              <p className="text-sm"><span className="text-gray-600">Ground Speed:</span> {aircraft.gs} knots</p>
              <p className="text-sm"><span className="text-gray-600">Heading:</span> {aircraft.heading}°</p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}