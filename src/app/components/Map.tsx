"use client";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Define custom icon without modifying prototype
const customIcon = new L.Icon({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Aircraft = {
  reg: string;
  lat: number;
  lon: number;
  details: string;
};

export default function TrackerMap({ flying }: { flying: Aircraft[] }) {
  return (
    <MapContainer center={[52.2958, 5.6177]} zoom={8} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {flying.map((aircraft) => (
        <Marker key={aircraft.reg} position={[aircraft.lat, aircraft.lon]} icon={customIcon}>
          <Popup>{aircraft.reg} - {aircraft.details}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}