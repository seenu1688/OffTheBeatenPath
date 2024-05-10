import { nanoid } from "nanoid";

import { Button } from "@/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { LocationSearch } from "./LocationSearch";
import { useMemo, useState } from "react";
import { useLocations } from "../hooks/useLocations";

export enum LocationType {
  Origin,
  Destination,
}

type Props = {
  type: LocationType;
  onOpenChange: (open: boolean) => void;
  locationId?: null | string;
};

const AddLocationButton = ({ type, onOpenChange, locationId }: Props) => {
  const [location, setLocation] =
    useState<google.maps.places.PlaceResult | null>(null);
  const { addLocation, updateLocation } = useLocations((state) => ({
    addLocation: state.addLocation,
    updateLocation: state.updateLocation,
  }));
  const locations = useLocations((state) => state.locations);
  const currentPlace = useMemo(() => {
    if (!locationId) return null;

    const location = locations.find((location) => location.id === locationId);

    if (!location) return null;

    return {
      label: location.name,
      value: location.placeId,
    };
  }, [locationId, locations]);

  return (
    <Dialog
      onOpenChange={onOpenChange}
      {...(!!currentPlace
        ? {
            open: true,
          }
        : {})}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gray-300 hover:bg-gray-200">
          {type === LocationType.Origin ? "Add Origin" : "Add New Destination"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === LocationType.Origin
              ? "Add Origin"
              : "Add New Destination"}
          </DialogTitle>
        </DialogHeader>
        <LocationSearch onPlaceSelect={setLocation} place={currentPlace} />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={!location}
              onClick={() => {
                if (!!currentPlace) {
                  updateLocation({
                    id: locationId!,
                    name: location!.formatted_address!,
                    lat: location!.geometry!.location!.lat()!,
                    lng: location!.geometry!.location!.lng(),
                    placeId: location?.place_id ?? ""!,
                  });
                  return;
                }

                addLocation({
                  id: nanoid(),
                  name: location!.formatted_address!,
                  lat: location!.geometry!.location!.lat()!,
                  lng: location!.geometry!.location!.lng(),
                  placeId: location?.place_id ?? ""!,
                });
                setLocation(null);
              }}
            >
              Add Location
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationButton;
