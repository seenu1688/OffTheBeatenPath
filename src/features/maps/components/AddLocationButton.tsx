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
};

const AddLocationButton = ({ type }: Props) => {
  const [location, setLocation] =
    useState<google.maps.places.PlaceResult | null>(null);
  const addLocation = useLocations((state) => state.addLocation);

  return (
    <Dialog>
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
        <LocationSearch onPlaceSelect={setLocation} />
        <DialogFooter>
          <DialogClose>
            <Button
              disabled={!location}
              onClick={() => {
                addLocation({
                  id: Math.random(),
                  name: location!.formatted_address!,
                  lat: location!.geometry!.location!.lat()!,
                  lng: location!.geometry!.location!.lng(),
                  travelMode: "DRIVING",
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
