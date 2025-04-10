"use client";
import dynamic from "next/dynamic";
import { useState } from "react";

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
  },
  "Vans RV-10": {
    description: "The RV-10 is a four-seat kit plane designed for cross-country travel.",
    imageGallery: [
      "https://example.com/images/rv-10-1.jpg",
      "https://example.com/images/rv-10-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Vans_RV-10",
  },
  "Vans RV-14": {
    description: "The RV-14 is a modern two-seat kit plane with improved performance.",
    imageGallery: [
      "https://example.com/images/rv-14-1.jpg",
      "https://example.com/images/rv-14-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Vans_RV-14",
  },
  "Sonex Sonex": {
    description: "The Sonex is a two-seat kit plane known for its simplicity and efficiency.",
    imageGallery: [
      "https://example.com/images/sonex-1.jpg",
      "https://example.com/images/sonex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Sonex",
  },
  "Sonex Waiex": {
    description: "The Waiex is a Y-tail variant of the Sonex, offering a unique design.",
    imageGallery: [
      "https://example.com/images/waiex-1.jpg",
      "https://example.com/images/waiex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Waiex",
  },
  "Sonex Onex": {
    description: "The Onex is a single-seat kit plane designed for sport flying.",
    imageGallery: [
      "https://example.com/images/onex-1.jpg",
      "https://example.com/images/onex-2.jpg",
    ],
    link: "https://en.wikipedia.org/wiki/Sonex_Aircraft_Onex",
  },
};

type RegistrationData = {
  [key: string]: {
    description: string;
    imageGallery: string[];
    links: string[];
    brand: string;
    type: string;
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
  },
};

const pastFlights = [
  { reg: "PH-XYZ", brand: "Vans", type: "RV-8", takeoff: "Schiphol", landing: "Rotterdam", time: "2 hours ago" },
  { reg: "PH-ABC", brand: "Sonex", type: "Sonex", takeoff: "Eindhoven", landing: "Utrecht", time: "5 hours ago" },
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
                  className="relative bg-gray-50 p-2 rounded-md shadow-sm border-2 border-gray-200"
                >
                  <div className="flex justify-between items-start">
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
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
                <p>
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
                <div>
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