import { useEffect, useMemo } from "react";
import { create } from "zustand";

import { Destination } from "@/common/types";
import { toast } from "sonner";

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
    filters: ["destinations", "activities", "lodging", "other"],
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

  const data = useMemo(() => {
    let _filters = [...filters];

    if (_filters.includes("other")) {
      _filters = [..._filters, ...otherFilters];
    }

    if (_filters.length === 0) {
      return destinations;
    }

    return destinations.filter((destination) => {
      return _filters.includes(destination.vendorType);
    });
  }, [destinations, filters]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    toast.info(`Found ${data.length} destinations.`, {
      dismissible: true,
      id: "filtered-destinations",
    });
  }, [data]);

  return data;
};
