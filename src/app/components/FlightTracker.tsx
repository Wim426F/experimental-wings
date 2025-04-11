"use client";
import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { format, differenceInMinutes } from "date-fns";

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

type BrandData = {
  [key: string]: {
    description: string;
    link: string;
    models: string[];
  };
};

const brandData: BrandData = {
  Vans: {
    description: "Vans Aircraft is a leading manufacturer of experimental kit planes, known for their RV series.",
    link: "https://en.wikipedia.org/wiki/Vans_Aircraft",
    models: ["RV-8", "RV-10", "RV-14"],
  },
  Sonex: {
    description: "Sonex Aircraft specializes in affordable, high-performance kit planes for amateur builders.",
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft",
    models: ["Sonex", "Waiex", "Onex"],
  },
};

type ModelData = {
  [key: string]: {
    description: string;
    imageGallery: string[];
    link: string;
    generalInfo: {
      brand: string;
      topSpeed: string;
      mtow: string;
    };
    registrations: string[];
  };
};

const modelData: ModelData = {
  "Vans RV-8": {
    description: "The RV-8 is a two-seat, tandem kit plane known for its aerobatic capabilities.",
    imageGallery: [
      "https://example.com/images/rv-8-1.jpg",
      "https://example.com/images/rv-8-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Vans_RV-8",
    generalInfo: {
      brand: "Vans",
      topSpeed: "220 knots",
      mtow: "1800 lbs",
    },
    registrations: ["PH-XYZ"],
  },
  "Vans RV-10": {
    description: "The RV-10 is a four-seat kit plane designed for cross-country travel.",
    imageGallery: [
      "https://example.com/images/rv-10-1.jpg",
      "https://example.com/images/rv-10-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Vans_RV-10",
    generalInfo: {
      brand: "Vans",
      topSpeed: "200 knots",
      mtow: "2700 lbs",
    },
    registrations: ["PH-WIM"],
  },
  "Vans RV-14": {
    description: "The RV-14 is a modern two-seat kit plane with improved performance.",
    imageGallery: [
      "https://example.com/images/rv-14-1.jpg",
      "https://example.com/images/rv-14-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Vans_RV-14",
    generalInfo: {
      brand: "Vans",
      topSpeed: "210 knots",
      mtow: "2050 lbs",
    },
    registrations: [],
  },
  "Sonex Sonex": {
    description: "The Sonex is a two-seat kit plane known for its simplicity and efficiency.",
    imageGallery: [
      "https://example.com/images/sonex-1.jpg",
      "https://example.com/images/sonex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Sonex",
    generalInfo: {
      brand: "Sonex",
      topSpeed: "170 knots",
      mtow: "1150 lbs",
    },
    registrations: ["PH-ABC"],
  },
  "Sonex Waiex": {
    description: "The Waiex is a Y-tail variant of the Sonex, offering a unique design.",
    imageGallery: [
      "https://example.com/images/waiex-1.jpg",
      "https://example.com/images/waiex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Waiex",
    generalInfo: {
      brand: "Sonex",
      topSpeed: "165 knots",
      mtow: "1150 lbs",
    },
    registrations: ["PH-BOO", "PH-SMD"],
  },
  "Sonex Onex": {
    description: "The Onex is a single-seat kit plane designed for sport flying.",
    imageGallery: [
      "https://example.com/images/onex-1.jpg",
      "https://example.com/images/onex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Onex",
    generalInfo: {
      brand: "Sonex",
      topSpeed: "160 knots",
      mtow: "950 lbs",
    },
    registrations: [],
  },
};

type RegistrationData = {
  [key: string]: {
    description: string;
    imageGallery: string[];
    links: string[];
    brand: string;
    type: string;
    flightHistory: {
      takeoff: string;
      landing: string;
      takeoffDateTime: string;
      landingDateTime: string;
      distance: number; // Distance in km
    }[];
  };
};

const registrationData: RegistrationData = {
  "PH-WIM": {
    description: "This is a Vans RV-10 built by a local enthusiast in 2020. Known for its sleek design and performance.",
    imageGallery: [
      "https://example.com/images/ph-rvt-1.jpg",
      "https://example.com/images/ph-rvt-2.jpg",
    ],
    links: [
      "https://planespotters.net/aircraft/PH-RVT",
      "https://flightaware.com/live/flight/PH-RVT",
    ],
    brand: "Vans",
    type: "RV-10",
    flightHistory: [
      {
        takeoff: "Schiphol",
        landing: "Eindhoven",
        takeoffDateTime: "2025-04-08T14:30:00Z",
        landingDateTime: "2025-04-08T16:00:00Z",
        distance: 110, // Approximate distance in km
      },
      {
        takeoff: "Eindhoven",
        landing: "Rotterdam",
        takeoffDateTime: "2025-04-06T10:00:00Z",
        landingDateTime: "2025-04-06T11:00:00Z",
        distance: 85, // Approximate distance in km
      },
    ],
  },
  "PH-BOO": {
    description: "A Sonex model built in 2018, often seen flying around Utrecht.",
    imageGallery: [
      "https://example.com/images/ph-smd-1.jpg",
      "https://example.com/images/ph-smd-2.jpg",
    ],
    links: [
      "https://planespotters.net/aircraft/PH-SMD",
      "https://flightaware.com/live/flight/PH-SMD",
    ],
    brand: "Sonex",
    type: "Waiex",
    flightHistory: [
      {
        takeoff: "Utrecht",
        landing: "Amsterdam",
        takeoffDateTime: "2025-04-09T12:00:00Z",
        landingDateTime: "2025-04-09T12:30:00Z",
        distance: 35, // Approximate distance in km
      },
      {
        takeoff: "Amsterdam",
        landing: "Utrecht",
        takeoffDateTime: "2025-04-07T15:00:00Z",
        landingDateTime: "2025-04-07T15:30:00Z",
        distance: 35, // Approximate distance in km
      },
    ],
  },
  "PH-XYZ": {
    description: "A Vans RV-8 spotted frequently in Amsterdam airspace.",
    imageGallery: [
      "https://example.com/images/ph-xyz-1.jpg",
      "https://example.com/images/ph-xyz-2.jpg",
    ],
    links: [
      "https://planespotters.net/aircraft/PH-XYZ",
      "https://flightaware.com/live/flight/PH-XYZ",
    ],
    brand: "Vans",
    type: "RV-8",
    flightHistory: [
      {
        takeoff: "Schiphol",
        landing: "Rotterdam",
        takeoffDateTime: "2025-04-11T14:30:00Z",
        landingDateTime: "2025-04-11T15:00:00Z",
        distance: 45, // Approximate distance in km
      },
      {
        takeoff: "Rotterdam",
        landing: "Schiphol",
        takeoffDateTime: "2025-04-10T09:00:00Z",
        landingDateTime: "2025-04-10T09:30:00Z",
        distance: 45, // Approximate distance in km
      },
    ],
  },
  "PH-ABC": {
    description: "A Sonex aircraft known for its vibrant paint job.",
    imageGallery: [
      "https://example.com/images/ph-abc-1.jpg",
      "https://example.com/images/ph-abc-2.jpg",
    ],
    links: [
      "https://planespotters.net/aircraft/PH-ABC",
      "https://flightaware.com/live/flight/PH-ABC",
    ],
    brand: "Sonex",
    type: "Sonex",
    flightHistory: [
      {
        takeoff: "Eindhoven",
        landing: "Utrecht",
        takeoffDateTime: "2025-04-11T09:00:00Z",
        landingDateTime: "2025-04-11T09:30:00Z",
        distance: 50, // Approximate distance in km
      },
      {
        takeoff: "Utrecht",
        landing: "Eindhoven",
        takeoffDateTime: "2025-04-09T14:00:00Z",
        landingDateTime: "2025-04-09T14:30:00Z",
        distance: 50, // Approximate distance in km
      },
    ],
  },
};

const pastFlights = [
  {
    reg: "PH-XYZ",
    brand: "Vans",
    type: "RV-8",
    takeoff: "Schiphol",
    landing: "Rotterdam",
    takeoffDateTime: "2025-04-11T14:30:00Z",
    landingDateTime: "2025-04-11T15:00:00Z",
    distance: 45, // Approximate distance in km
  },
  {
    reg: "PH-ABC",
    brand: "Sonex",
    type: "Sonex",
    takeoff: "Eindhoven",
    landing: "Utrecht",
    takeoffDateTime: "2025-04-11T09:00:00Z",
    landingDateTime: "2025-04-11T09:30:00Z",
    distance: 50, // Approximate distance in km
  },
];

export default function FlightTracker({ flying }: { flying: Aircraft[] }) {
  const [sidebarContent, setSidebarContent] = useState<"default" | "all-brands" | "reg" | "brand" | "type">("default");
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);

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

    // Search brands
    Object.keys(brandData).forEach((key) => {
      if (key.toLowerCase().includes(lowerQuery)) {
        results.push({ type: "brand", name: key });
      }
    });

    // Search models
    Object.keys(modelData).forEach((key) => {
      if (key.toLowerCase().includes(lowerQuery)) {
        const [brand, model] = key.split(" ");
        results.push({ type: "model", name: key, brand, model });
      }
    });

    // Search registrations
    Object.keys(registrationData).forEach((reg) => {
      if (reg.toLowerCase().includes(lowerQuery)) {
        const { brand, type: model } = registrationData[reg];
        results.push({ type: "reg", name: reg, brand, model });
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

  const formatDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const minutes = differenceInMinutes(endDate, startDate);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

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
            <p className="mb-4">Track homebuilt airplanes in your region and explore their flight history.</p>
            <button
              onClick={() => setSidebarContent("all-brands")}
              className="mb-4 text-blue-800 hover:underline hover:text-blue-900"
            >
              Browse All Experimental Wings
            </button>
            <h3 className="text-lg font-semibold mb-2">Recent Flights</h3>
            <ul className="space-y-2">
              {pastFlights.map((flight, index) => (
                <li
                  key={index}
                  className="bg-gray-50 p-2 rounded-md shadow-sm border border-gray-200 overflow-visible"
                >
                  <div className="flex justify-between mb-1">
                    <button
                      onClick={() =>
                        handleRegClick({
                          reg: flight.reg,
                          lat: 0,
                          lon: 0,
                          heading: 0,
                          alt_baro: 0,
                          gs: 0,
                          ias: 0,
                          brand: flight.brand,
                          type: flight.type,
                          details: "Unknown",
                          lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                        })
                      }
                      className="font-medium text-sm text-blue-800 hover:underline hover:text-blue-900"
                    >
                      {flight.reg}
                    </button>
                    <span className="font-medium text-sm text-blue-800">
                      {flight.brand} {flight.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{flight.takeoff}</span>
                    <span>{flight.landing}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mb-1">
                    <span>{format(new Date(flight.takeoffDateTime), "HH:mm")}</span>
                    <span className="text-xs text-gray-600">
                      {format(new Date(flight.takeoffDateTime), "dd/MM/yyyy")}
                    </span>
                    <span>{format(new Date(flight.landingDateTime), "HH:mm")}</span>
                  </div>
                  <div className="flex items-center mb-1">
                    <span className="w-3 h-3 bg-gray-600 rounded-full relative -mr-1 ml-0.5"></span>
                    <div className="flex-1 border-t border-gray-400 mx-0"></div>
                    <span className="w-3 h-3 bg-gray-600 rounded-full relative -ml-1"></span>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    {formatDuration(flight.takeoffDateTime, flight.landingDateTime)}, {flight.distance} km
                  </div>
                </li>
              ))}
            </ul>
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
                            lat: 0,
                            lon: 0,
                            heading: 0,
                            alt_baro: 0,
                            gs: 0,
                            ias: 0,
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
                            lat: 0,
                            lon: 0,
                            heading: 0,
                            alt_baro: 0,
                            gs: 0,
                            ias: 0,
                            brand: result.brand!,
                            type: result.model!,
                            details: "",
                            lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                          });
                          clearSearch();
                        }}
                        className="text-blue-800 hover:underline hover:text-blue-900"
                      >
                        {result.name} (Model)
                      </button>
                    )}
                    {result.type === "reg" && (
                      <button
                        onClick={() => {
                          handleRegClick({
                            reg: result.name,
                            lat: 0,
                            lon: 0,
                            heading: 0,
                            alt_baro: 0,
                            gs: 0,
                            ias: 0,
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
            {(!searchQuery || searchResults.length === 0) && (
              <ul className="space-y-2">
                {Object.keys(brandData).map((brand) => (
                  <li key={brand}>
                    <button
                      onClick={() =>
                        handleBrandClick({
                          reg: "",
                          lat: 0,
                          lon: 0,
                          heading: 0,
                          alt_baro: 0,
                          gs: 0,
                          ias: 0,
                          brand,
                          type: "",
                          details: "",
                          lastPosition: { lat: 0, lon: 0, seen_pos: 0 },
                        })
                      }
                      className="text-blue-800 hover:underline hover:text-blue-900"
                    >
                      {brand}
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
            {brandData[selectedAircraft.brand] ? (
              <div>
                <p className="mb-4">{brandData[selectedAircraft.brand].description}</p>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Models</h3>
                  <ul className="list-disc pl-5">
                    {brandData[selectedAircraft.brand].models.map((model: string, index: number) => (
                      <li key={index} className="text-blue-800 hover:underline hover:text-blue-900">
                        <button
                          onClick={() =>
                            handleTypeClick({
                              ...selectedAircraft,
                              type: model,
                            })
                          }
                        >
                          {model}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                <p>
                  <strong>Learn More:</strong>{" "}
                  <a
                    href={brandData[selectedAircraft.brand].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline hover:text-blue-900"
                  >
                    Wikipedia
                  </a>
                </p>
              </div>
            ) : (
              <p>No brand data available for {selectedAircraft.brand}.</p>
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
            {modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`] ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">General Information</h3>
                  <table className="w-full text-sm text-gray-700">
                    <tbody>
                      <tr>
                        <td className="font-medium pr-2">Brand:</td>
                        <td>{modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].generalInfo.brand}</td>
                      </tr>
                      <tr>
                        <td className="font-medium pr-2">Top Speed:</td>
                        <td>{modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].generalInfo.topSpeed}</td>
                      </tr>
                      <tr>
                        <td className="font-medium pr-2">MTOW:</td>
                        <td>{modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].generalInfo.mtow}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mb-4">{modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].description}</p>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Image Gallery</h3>
                  <div className="flex space-x-2 overflow-x-auto">
                    {modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].imageGallery.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedAircraft.brand} ${selectedAircraft.type} image ${index + 1}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
                <p className="mb-4">
                  <strong>Learn More:</strong>{" "}
                  <a
                    href={modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-800 hover:underline hover:text-blue-900"
                  >
                    Wikipedia
                  </a>
                </p>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Registrations</h3>
                  {modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].registrations.length > 0 ? (
                    <ul className="list-disc pl-5">
                      {modelData[`${selectedAircraft.brand} ${selectedAircraft.type}`].registrations.map((reg: string, index: number) => (
                        <li key={index}>
                          <button
                            onClick={() =>
                              handleRegClick({
                                ...selectedAircraft,
                                reg,
                              })
                            }
                            className="text-blue-800 hover:underline hover:text-blue-900"
                          >
                            {reg}
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No registrations available for this model.</p>
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
            {registrationData[selectedAircraft.reg] ? (
              <div>
                <p className="mb-4">{registrationData[selectedAircraft.reg].description}</p>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Image Gallery</h3>
                  <div className="flex space-x-2 overflow-x-auto">
                    {registrationData[selectedAircraft.reg].imageGallery.map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`${selectedAircraft.reg} image ${index + 1}`}
                        className="h-24 w-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Links</h3>
                  <ul className="list-disc pl-5">
                    {registrationData[selectedAircraft.reg].links.map((link: string, index: number) => (
                      <li key={index}>
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-800 hover:underline hover:text-blue-900"
                        >
                          Link {index + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Flight History</h3>
                  {registrationData[selectedAircraft.reg].flightHistory.length > 0 ? (
                    <ul className="space-y-2">
                      {registrationData[selectedAircraft.reg].flightHistory.map((flight, index: number) => (
                        <li
                          key={index}
                          className="bg-gray-50 p-2 rounded-md shadow-sm border border-gray-200 overflow-visible"
                        >
                          <div className="flex justify-between text-sm mb-1">
                            <span>{flight.takeoff}</span>
                            <span>{flight.landing}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm mb-1">
                            <span>{format(new Date(flight.takeoffDateTime), "HH:mm")}</span>
                            <span className="text-xs text-gray-600">
                              {format(new Date(flight.takeoffDateTime), "dd/MM/yyyy")}
                            </span>
                            <span>{format(new Date(flight.landingDateTime), "HH:mm")}</span>
                          </div>
                          <div className="flex items-center mb-1">
                            <span className="w-3 h-3 bg-gray-600 rounded-full relative -mr-1 ml-0.5"></span>
                            <div className="flex-1 border-t border-gray-400 mx-0"></div>
                            <span className="w-3 h-3 bg-gray-600 rounded-full relative -ml-1"></span>
                          </div>
                          <div className="text-xs text-gray-600 text-center">
                            {formatDuration(flight.takeoffDateTime, flight.landingDateTime)}, {flight.distance} km
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No flight history available for this registration.</p>
                  )}
                </div>
              </div>
            ) : (
              <p>No wiki data available for {selectedAircraft.reg}.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}