import LocationCard from "./components/LocationCard";
import AddLocationButton, {
  LocationType,
} from "./components/AddLocationButton";

import { useLocations } from "./hooks/useLocations";

const Sidebar = () => {
  const locations = useLocations((state) => state.locations);

  return (
    <div className="w-[350px] h-full p-4 shadow-md bg-[#f3f3f3] flex flex-col gap-8 relative overflow-y-auto dashed-line">
      {locations.map((location, index) => {
        return (
          <LocationCard
            key={location.id}
            location={location}
            order={index + 1}
          />
        );
      })}
      <div className="flex justify-center">
        <AddLocationButton
          type={
            locations.length === 0
              ? LocationType.Origin
              : LocationType.Destination
          }
        />
      </div>
    </div>
  );
};

export default Sidebar;
