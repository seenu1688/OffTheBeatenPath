import { create } from "zustand";
import { Bike, Bus, Car, PersonStanding, Plane } from "lucide-react";

import { filter } from "@/lib/utils";

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
  WALKING: {
    color: "#FF5733",
  },
  BICYCLING: {
    color: "#FF5733",
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
  {
    id: "WALKING",
    name: "Walking",
    icon: PersonStanding,
  },
  {
    id: "BICYCLING",
    name: "Bicycling",
    icon: Bike,
  },
] as const;

export type RouteType = (typeof routes)[number]["id"];

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
  enabled: boolean;
  addLocation: (location: Location) => void;
  deleteLocation: (id: string) => void;
  updateLocation: (location: Partial<Location>) => void;
  setLocations: (locations: Location[]) => void;
  toggleLocations: (enabled: boolean) => void;
};

export const useLocations = create<LocationsState>((set) => {
  return {
    locations: [],
    enabled: true,
    toggleLocations: (enabled: boolean) => {
      set({ enabled });
    },
    addLocation: (location: Location) => {
      set((state) => {
        if (state.locations.length === 0) {
          return {
            locations: [location],
          };
        }

        const exists = state.locations.find(
          (loc) => loc.lat === location.lat || loc.lng === location.lng
        );

        if (!!exists) {
          return state;
        }

        const length = state.locations.length;
        const lastLocation = state.locations[length - 1];

        return {
          locations: [
            ...state.locations.slice(0, length - 1),
            {
              ...lastLocation,
              travelMode: "DRIVING",
            },
            location,
          ],
        };
      });
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
    setLocations: (locations: Location[]) => {
      set({ locations });
    },
  };
});
