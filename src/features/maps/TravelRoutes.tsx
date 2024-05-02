import { useRef, useState } from "react";
import { Reorder } from "framer-motion";

import AddLocationButton, {
  LocationType,
} from "./components/AddLocationButton";
import LocationCard from "./components/LocationCard";

import { useLocations, Location } from "./hooks/useLocations";
import { useDistance } from "./hooks/useDistance";
import { debounce } from "@/lib/utils";

const TravelRoutes = () => {
  const { locations, deleteLocation, updateLocation, setLocations } =
    useLocations((state) => state);
  const [locationId, setLocationId] = useState<null | string>(null);
  const { removeMeta } = useDistance();

  const handleReorder = (locations: Location[]) => {
    setLocations(
      locations.map((location, index) => {
        if (index === 0) {
          return {
            ...location,
            travelMode: !location.travelMode ? "DRIVING" : location.travelMode,
          };
        }

        if (index === locations.length - 1) {
          return {
            ...location,
            travelMode: null,
          };
        }

        return location;
      })
    );
  };
  const callbackRef = useRef(debounce(handleReorder, 500));

  const handleAction = (payload: {
    type: "EDIT" | "DELETE" | "SCHEDULE";
    location: Location;
  }) => {
    const { location, type } = payload;

    switch (type) {
      case "EDIT":
        setLocationId(location.id);
        break;

      case "DELETE":
        deleteLocation(location.id);
        removeMeta(location.id);
        break;

      case "SCHEDULE":
        updateLocation(location);
        break;
    }
  };

  return (
    <div className="h-full w-full">
      <Reorder.Group
        axis="y"
        values={locations}
        onReorder={callbackRef.current}
      >
        {locations.map((location, index) => {
          return (
            <Reorder.Item key={location.id} value={location}>
              <LocationCard
                key={location.id}
                location={location}
                order={index + 1}
                onAction={handleAction}
                isLast={index === locations.length - 1}
              />
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      <div className="flex justify-center pt-5">
        <AddLocationButton
          type={
            locations.length === 0
              ? LocationType.Origin
              : LocationType.Destination
          }
          onOpenChange={(open) => {
            if (!open && !!locationId) {
              setLocationId(null);
            }
          }}
          locationId={locationId}
        />
      </div>
    </div>
  );
};

export default TravelRoutes;
