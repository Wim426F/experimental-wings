import MapWrapper from "./components/FlightTracker";
import { getBrands, getModels, getAircraftList } from "../lib/strapi";

export default async function Home() {
  const [brands, models, strapiAircraft] = await Promise.all([
    getBrands(),
    getModels(),
    getAircraftList(),
  ]);

  return (
    <MapWrapper
      brands={brands}
      models={models}
      strapiAircraft={strapiAircraft}
    />
  );
}
