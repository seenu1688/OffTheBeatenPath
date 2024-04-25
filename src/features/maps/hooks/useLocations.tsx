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
  addLocation: (location: Location) => void;
  deleteLocation: (id: number) => void;
  updateLocation: (location: Partial<Location>) => void;
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
      {
        id: 1,
        name: "Anekal, Karnataka, India",
        lat: 12.7090575,
        lng: 77.6992265,
        travelMode: "DRIVING",
      },
      {
        id: 2,
        name: "Bengaluru, Karnataka, India",
        lat: 12.9715987,
        lng: 77.5945627,
      },
      {
        id: 3,
        name: "Mysuru, Karnataka, India",
        lat: 12.2958104,
        lng: 76.6393805,
      },
    ],
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
    deleteLocation: (id: number) => {
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
