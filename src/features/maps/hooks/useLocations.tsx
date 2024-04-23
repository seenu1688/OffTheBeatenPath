import { create } from "zustand";

export type Location = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  duration?: string;
  travelMode?: "DRIVING";
};

type LocationsState = {
  locations: Location[];
};

export const useLocations = create<LocationsState>((set) => {
  return {
    locations: [
      // {
      //   id: 1,
      //   name: "100 Front St, Toronto ON",
      //   lat: 43.6456,
      //   lng: -79.3754,
      //   travelMode: "DRIVING",
      // },
      // {
      //   id: 2,
      //   name: "500 College St, Toronto ON",
      //   lat: 43.6594,
      //   lng: -79.3995,
      // },
    ],
  };
});
