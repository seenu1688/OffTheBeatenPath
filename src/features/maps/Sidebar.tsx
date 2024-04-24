import LocationCard from "./components/LocationCard";
import AddLocationButton, {
  LocationType,
} from "./components/AddLocationButton";

import { useLocations, Location } from "./hooks/useLocations";

const Sidebar = () => {
  const { locations, deleteLocation } = useLocations((state) => state);

  const handleAction = (payload: {
    type: "EDIT" | "DELETE" | "SCHEDULE";
    location: Location;
  }) => {
    const { location, type } = payload;

    switch (type) {
      case "EDIT":
        console.log("Edit action");
        break;

      case "DELETE":
        deleteLocation(location.id);
        break;

      case "SCHEDULE":
        console.log("Schedule action");
        break;
    }
  };

  return (
    <div className="w-[350px] h-full p-4 shadow-md bg-[#f3f3f3] flex flex-col relative overflow-y-auto dashed-line">
      {locations.map((location, index) => {
        return (
          <LocationCard
            key={location.id}
            location={location}
            order={index + 1}
            onAction={handleAction}
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
