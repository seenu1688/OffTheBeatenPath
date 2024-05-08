import { useMemo, useDeferredValue } from "react";
import { create } from "zustand";

import { Destination } from "@/common/types";

export type FilterType = "destinations" | "activities" | "lodging" | "other";

type DestinationState = {
  destinations: Destination[];
  setDestinations: (callback: (state: Destination[]) => Destination[]) => void;
};

type DestinationFilters = {
  filters: string[];
  setFilters: (filter: FilterType) => void;
  removeFilter: (filter: FilterType) => void;
};

export const filters = [
  {
    name: "Destinations",
    id: "destinations",
  },
  {
    name: "Activities",
    id: "activities",
  },
  {
    name: "Lodging",
    id: "lodging",
  },
  {
    name: "Other",
    id: "other",
  },
] as const;

export const useDestinations = create<DestinationState>((set, get) => ({
  destinations: [],
  setDestinations: (callback) => {
    set({ destinations: callback(get().destinations) });
  },
}));

export const useDestinationFilters = create<DestinationFilters>((set, get) => {
  return {
    filters: [],
    setFilters: (filter) => set({ filters: [...get().filters, filter] }),
    removeFilter: (filter) => {
      set({ filters: get().filters.filter((f) => f !== filter) });
    },
  };
});

const otherFilters = ["transportation", "food & beverage", "guide service"];

export const useFilteredDestinations = () => {
  const destinations = useDestinations((state) => state.destinations);
  const filters = useDestinationFilters((state) => state.filters);
  const fills = useDeferredValue(filters);

  const data = useMemo(() => {
    let _filters = [...fills];

    if (_filters.includes("other")) {
      _filters = [..._filters, ...otherFilters];
    }

    if (_filters.length === 0) {
      return destinations;
    }

    return destinations.filter((destination) => {
      return _filters.includes(destination.vendorType);
    });
  }, [destinations, fills]);

  return data;
};
