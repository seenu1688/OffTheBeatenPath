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
import { useState } from "react";
import { useLocations } from "../hooks/useLocations";

export enum LocationType {
  Origin,
  Destination,
}

type Props = {
  type: LocationType;
  onOpenChange: (open: boolean) => void;
  place?: null | {
    label: string;
    value: string;
  };
};

const AddLocationButton = ({ type, onOpenChange, place }: Props) => {
  const [location, setLocation] =
    useState<google.maps.places.PlaceResult | null>(null);
  const addLocation = useLocations((state) => state.addLocation);

  return (
    <Dialog
      onOpenChange={onOpenChange}
      {...(place
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
        <LocationSearch onPlaceSelect={setLocation} place={place} />
        <DialogFooter>
          <DialogClose asChild>
            <Button
              disabled={!location}
              onClick={() => {
                addLocation({
                  id: nanoid(),
                  name: location!.formatted_address!,
                  lat: location!.geometry!.location!.lat()!,
                  lng: location!.geometry!.location!.lng(),
                  placeId: location?.place_id ?? ""!,
                });
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
