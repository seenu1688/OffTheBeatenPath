import { useState } from "react";

import LocationCard from "./components/LocationCard";
import AddLocationButton, {
  LocationType,
} from "./components/AddLocationButton";

import { useLocations, Location } from "./hooks/useLocations";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { locations, deleteLocation, updateLocation } = useLocations(
    (state) => state
  );
  const [place, setPlace] = useState<null | {
    label: string;
    value: string;
  }>(null);

  const handleAction = (payload: {
    type: "EDIT" | "DELETE" | "SCHEDULE";
    location: Location;
  }) => {
    const { location, type } = payload;

    switch (type) {
      case "EDIT":
        setPlace({
          label: location.name,
          value: location.placeId,
        });
        break;

      case "DELETE":
        deleteLocation(location.id);
        break;

      case "SCHEDULE":
        updateLocation(location);
        break;
    }
  };

  return (
    <div
      className={cn(
        "w-[350px] h-full p-4 shadow-md bg-[#f3f3f3] flex flex-col gap-4",
        "relative overflow-y-auto dashed-line"
      )}
    >
      {locations.map((location, index) => {
        return (
          <LocationCard
            key={location.id}
            location={location}
            order={index + 1}
            onAction={handleAction}
            isLast={index === locations.length - 1}
          />
        );
      })}
      <div className="flex justify-center mt-5">
        <AddLocationButton
          type={
            locations.length === 0
              ? LocationType.Origin
              : LocationType.Destination
          }
          onOpenChange={(open) => {
            if (!open && !!place) {
              setPlace(null);
            }
          }}
          place={place}
        />
      </div>
    </div>
  );
};

export default Sidebar;
