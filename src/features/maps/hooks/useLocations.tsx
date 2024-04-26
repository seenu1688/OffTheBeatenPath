import { Bus, Car, Plane } from "lucide-react";
import { create } from "zustand";

export const travelModeMap = {
  DRIVING: {
    color: "#6D4482",
  },
  FLIGHT: {
    color: "#5BC6A8",
  },
  TRANSIT: {
    color: "#F3B13E",
  },
};

export const routes = [
  {
    id: "DRIVING",
    name: "Driving",
    icon: Car,
  },
  {
    id: "FLIGHT",
    name: "Flight",
    icon: Plane,
  },
  {
    id: "TRANSIT",
    name: "Transit",
    icon: Bus,
  },
] as const;

export type RouteType = (typeof routes)[number]["id"] | null;

export type Route = (typeof routes)[number];

export type Location = {
  id: string;
  name: string;
  placeId: string;
  lat: number;
  lng: number;
  duration?: string;
  travelMode?: RouteType | null;
};

type LocationsState = {
  locations: Location[];
  addLocation: (location: Location) => void;
  deleteLocation: (id: string) => void;
  updateLocation: (location: Partial<Location>) => void;
};

export const useLocations = create<LocationsState>((set) => {
  return {
    locations: [],
    addLocation: (location: Location) => {
      set((state) => ({
        locations: [...state.locations, location],
      }));
    },
    updateLocation: (location: Partial<Location>) => {
      set((state) => {
        return {
          locations: state.locations.map((loc) => {
            if (loc.id === location.id) {
              return {
                ...loc,
                ...location,
              };
            }

            return loc;
          }),
        };
      });
    },
    deleteLocation: (id: string) => {
      set((state) => {
        const sourceIndex = state.locations.findIndex(
          (location) => location.id === id
        );

        return {
          locations: filter(state.locations, (location, index) => {
            if (sourceIndex - 1 === index) {
              return {
                ...location,
                travelMode: undefined,
              };
            }

            return location.id !== id;
          }),
        };
      });
    },
  };
});

const filter = <T,>(
  locations: T[],
  callback: (location: T, index: number) => boolean | T
) => {
  const result: T[] = [];

  let index = 0;

  for (const location of locations) {
    const value = callback(location, index);

    if (typeof value === "boolean") {
      if (value) {
        result.push(location);
      }
    } else {
      result.push(value);
    }
    index++;
  }

  return result;
};
