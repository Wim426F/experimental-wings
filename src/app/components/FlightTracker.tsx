"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import type { StrapiBrand, StrapiModel, StrapiAircraft } from "../../lib/strapi";

const TrackerMap = dynamic(() => import("./TrackerMap"), { ssr: false });

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

export default function FlightTracker({
  brands,
  models,
  strapiAircraft,
}: {
  brands: StrapiBrand[];
  models: StrapiModel[];
  strapiAircraft: StrapiAircraft[];
}) {
  const [liveFlying, setLiveFlying] = useState<Aircraft[]>([]);
  const [sidebarContent, setSidebarContent] = useState<"default" | "all-brands" | "reg" | "brand" | "type">("default");
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/flying");
        if (res.ok) setLiveFlying(await res.json());
      } catch {}
    };
    poll();
    const interval = setInterval(poll, 15000);
    return () => clearInterval(interval);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    { type: "brand" | "model" | "reg"; name: string; brand?: string; model?: string }[]
  >([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase();
    const results: { type: "brand" | "model" | "reg"; name: string; brand?: string; model?: string }[] = [];

    brands.forEach((b) => {
      if (b.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: "brand", name: b.name });
      }
    });

    models.forEach((m) => {
      const fullName = `${m.brand?.name ?? ""} ${m.name}`;
      if (fullName.toLowerCase().includes(lowerQuery) || m.name.toLowerCase().includes(lowerQuery)) {
        results.push({ type: "model", name: m.name, brand: m.brand?.name ?? "", model: m.name });
      }
    });

    strapiAircraft.forEach((a) => {
      if (a.registration.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: "reg",
          name: a.registration,
          brand: a.model?.brand?.name ?? "",
          model: a.model?.name ?? "",
        });
      }
    });

    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
  };

  useEffect(() => {
    if (sidebarContent === "all-brands") {
      clearSearch();
    }
  }, [sidebarContent]);

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

  // Derived Strapi lookups
  const selectedBrand = selectedAircraft
    ? brands.find((b) => b.name === selectedAircraft.brand) ?? null
    : null;

  const brandModels = selectedAircraft
    ? models.filter((m) => m.brand?.name === selectedAircraft.brand)
    : [];

  const selectedModel = selectedAircraft
    ? models.find((m) => m.name === selectedAircraft.type && m.brand?.name === selectedAircraft.brand) ?? null
    : null;

  const modelAircraft = selectedAircraft
    ? strapiAircraft.filter(
        (a) => a.model?.name === selectedAircraft.type && a.model?.brand?.name === selectedAircraft.brand
      )
    : [];

  const selectedRegistration = selectedAircraft
    ? strapiAircraft.find((a) => a.registration === selectedAircraft.reg) ?? null
    : null;

  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className="w-2/3">
        <TrackerMap
          flying={liveFlying}
          onRegClick={handleRegClick}
          onBrandClick={handleBrandClick}
          onTypeClick={handleTypeClick}
        />
      </div>
      <div className="w-1/3 bg-gray-100 p-4 overflow-y-auto border-l-2 border-gray-300">
        {sidebarContent === "default" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Welcome to Experimental Wings</h2>
            <p className="mb-4">Track homebuilt airplanes in your region and explore their flight history.</p>
            <button
              onClick={() => setSidebarContent("all-brands")}
              className="mb-4 text-blue-800 hover:underline hover:text-blue-900"
            >
              Browse All Experimental Wings
            </button>
            <h3 className="text-lg font-semibold mb-2">Recent Flights</h3>
            <p className="text-sm text-gray-500">No recent flights yet.</p>
          </div>
        )}
        {sidebarContent === "all-brands" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Brands</h2>
              <button onClick={handleBack} className="text-blue-800 hover:underline hover:text-blue-900">
                Back to Home
              </button>
            </div>
            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search brands, models, or registrations..."
                className="w-full p-2 border border-gray-300 rounded"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              )}
            </div>
            {searchQuery && searchResults.length > 0 && (
              <ul className="mb-4 space-y-1">
                {searchResults.map((result, index) => (
                  <li key={index}>
                    {result.type === "brand" && (
                      <button
                        onClick={() => {
                          handleBrandClick({
                            reg: "",
                            lat: 0, lon: 0, heading: 0, alt_baro: 0, gs: 0, ias: 0,
                            brand: result.name,
                            type: "",
                            details: "",
                            lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                          });
                          clearSearch();
                        }}
                        className="text-blue-800 hover:underline hover:text-blue-900"
                      >
                        {result.name} (Brand)
                      </button>
                    )}
                    {result.type === "model" && (
                      <button
                        onClick={() => {
                          handleTypeClick({
                            reg: "",
                            lat: 0, lon: 0, heading: 0, alt_baro: 0, gs: 0, ias: 0,
                            brand: result.brand!,
                            type: result.model!,
                            details: "",
                            lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                          });
                          clearSearch();
                        }}
                        className="text-blue-800 hover:underline hover:text-blue-900"
                      >
                        {result.brand} {result.name} (Model)
                      </button>
                    )}
                    {result.type === "reg" && (
                      <button
                        onClick={() => {
                          handleRegClick({
                            reg: result.name,
                            lat: 0, lon: 0, heading: 0, alt_baro: 0, gs: 0, ias: 0,
                            brand: result.brand!,
                            type: result.model!,
                            details: "",
                            lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                          });
                          clearSearch();
                        }}
                        className="text-blue-800 hover:underline hover:text-blue-900"
                      >
                        {result.name} ({result.brand} {result.model})
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {searchQuery && searchResults.length === 0 && (
              <p className="text-sm text-gray-500">No results found.</p>
            )}
            {!searchQuery && (
              <ul className="space-y-2">
                {brands.map((brand) => (
                  <li key={brand.documentId}>
                    <button
                      onClick={() =>
                        handleBrandClick({
                          reg: "",
                          lat: 0, lon: 0, heading: 0, alt_baro: 0, gs: 0, ias: 0,
                          brand: brand.name,
                          type: "",
                          details: "",
                          lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                        })
                      }
                      className="text-blue-800 hover:underline hover:text-blue-900"
                    >
                      {brand.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {sidebarContent === "brand" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() => setSidebarContent("all-brands")}
                >
                  Brands
                </span>
                <span> / {selectedAircraft.brand}</span>
              </h2>
              <button onClick={handleBack} className="text-blue-800 hover:underline hover:text-blue-900">
                Back to Home
              </button>
            </div>
            {selectedBrand ? (
              <div>
                {selectedBrand.description && (
                  <p className="mb-4">{selectedBrand.description}</p>
                )}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Models</h3>
                  {brandModels.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {brandModels.map((m) => (
                        <li key={m.documentId} className="text-blue-800 hover:underline hover:text-blue-900">
                          <button
                            onClick={() =>
                              handleTypeClick({
                                ...selectedAircraft,
                                type: m.name,
                              })
                            }
                          >
                            {m.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No models found for this brand.</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No data available for {selectedAircraft.brand}.</p>
            )}
          </div>
        )}
        {sidebarContent === "type" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() => setSidebarContent("all-brands")}
                >
                  Brands
                </span>
                <span> / </span>
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() =>
                    handleBrandClick({
                      ...selectedAircraft,
                      type: "",
                    })
                  }
                >
                  {selectedAircraft.brand}
                </span>
                <span> / {selectedAircraft.type}</span>
              </h2>
              <button onClick={handleBack} className="text-blue-800 hover:underline hover:text-blue-900">
                Back to Home
              </button>
            </div>
            {selectedModel ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">General Information</h3>
                  <table className="w-full text-sm text-gray-700">
                    <tbody>
                      <tr>
                        <td className="font-medium pr-2">Brand:</td>
                        <td>{selectedModel.brand?.name ?? "—"}</td>
                      </tr>
                      {selectedModel.configuration && (
                        <tr>
                          <td className="font-medium pr-2">Configuration:</td>
                          <td>{selectedModel.configuration}</td>
                        </tr>
                      )}
                      {selectedModel.gross_weight != null && (
                        <tr>
                          <td className="font-medium pr-2">MTOW:</td>
                          <td>{selectedModel.gross_weight} kg</td>
                        </tr>
                      )}
                      {selectedModel.empty_weight != null && (
                        <tr>
                          <td className="font-medium pr-2">Empty Weight:</td>
                          <td>{selectedModel.empty_weight} kg</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Registrations</h3>
                  {modelAircraft.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {modelAircraft.map((a) => (
                        <li key={a.documentId}>
                          <button
                            onClick={() =>
                              handleRegClick({
                                ...selectedAircraft,
                                reg: a.registration,
                              })
                            }
                            className="text-blue-800 hover:underline hover:text-blue-900"
                          >
                            {a.registration}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No registrations found for this model.</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No model data available for {selectedAircraft.brand} {selectedAircraft.type}.</p>
            )}
          </div>
        )}
        {sidebarContent === "reg" && selectedAircraft && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() => setSidebarContent("all-brands")}
                >
                  Brands
                </span>
                <span> / </span>
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() =>
                    handleBrandClick({
                      ...selectedAircraft,
                      type: "",
                    })
                  }
                >
                  {selectedAircraft.brand}
                </span>
                <span> / </span>
                <span
                  className="text-blue-800 hover:underline hover:text-blue-900 cursor-pointer"
                  onClick={() => handleTypeClick(selectedAircraft)}
                >
                  {selectedAircraft.type}
                </span>
                <span> / {selectedAircraft.reg}</span>
              </h2>
              <button onClick={handleBack} className="text-blue-800 hover:underline hover:text-blue-900">
                Back to Home
              </button>
            </div>
            {selectedRegistration ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">General Information</h3>
                  <table className="w-full text-sm text-gray-700">
                    <tbody>
                      <tr>
                        <td className="font-medium pr-2">Registration:</td>
                        <td>{selectedRegistration.registration}</td>
                      </tr>
                      {selectedRegistration.model?.brand && (
                        <tr>
                          <td className="font-medium pr-2">Brand:</td>
                          <td>{selectedRegistration.model.brand.name}</td>
                        </tr>
                      )}
                      {selectedRegistration.model && (
                        <tr>
                          <td className="font-medium pr-2">Model:</td>
                          <td>{selectedRegistration.model.name}</td>
                        </tr>
                      )}
                      {selectedRegistration.icao_code && (
                        <tr>
                          <td className="font-medium pr-2">ICAO:</td>
                          <td>{selectedRegistration.icao_code}</td>
                        </tr>
                      )}
                      {selectedRegistration.serial_number && (
                        <tr>
                          <td className="font-medium pr-2">Serial:</td>
                          <td>{selectedRegistration.serial_number}</td>
                        </tr>
                      )}
                      {selectedRegistration.built_year != null && (
                        <tr>
                          <td className="font-medium pr-2">Built:</td>
                          <td>{selectedRegistration.built_year}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {selectedRegistration.story && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Story</h3>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedRegistration.story}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Flight History</h3>
                  <p className="text-sm text-gray-500">Flight history coming soon.</p>
                </div>
              </div>
            ) : (
              <p>No data available for {selectedAircraft.reg}.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
