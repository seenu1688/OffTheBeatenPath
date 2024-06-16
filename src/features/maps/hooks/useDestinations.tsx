import { useEffect, useMemo } from "react";
import { create } from "zustand";
import { toast } from "sonner";

import { Account, Destination } from "@/common/types";

export type FilterType = "destinations" | "activities" | "lodging" | "other";

export type DestType = Destination | Account;

type DestinationState = {
  destinations: DestType[];
  setDestinations: (callback: (state: DestType[]) => DestType[]) => void;
};

type DestinationFilters = {
  filters: string[];
  ids: string[];
  enabled: boolean;
  setFilters: (filter: FilterType) => void;
  removeFilter: (filter: FilterType) => void;
  toggleFilters: (enabled: boolean) => void;
  updateIds: (id: string[]) => void;
};

export const filters = [
  {
    name: "Destinations",
    id: "destinations",
  },
  {
    name: "Activities",
    id: "Activities",
  },
  {
    name: "Lodging",
    id: "Lodging",
  },
  {
    name: "Transportation",
    id: "Transportation",
  },
  {
    name: "Guide Service",
    id: "Guide Service",
  },
  {
    name: "Other",
    id: "Other",
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
    enabled: true,
    ids: [],
    setFilters: (filter) => set({ filters: [...get().filters, filter] }),
    removeFilter: (filter) => {
      set({ filters: get().filters.filter((f) => f !== filter) });
    },
    toggleFilters: (enabled: boolean) => {
      set({ enabled });
    },
    updateIds: (ids: string[]) => {
      set({
        ids,
      });
    },
  };
});

const otherFilters = ["food & beverage"];

export const filterDestinations = (props: {
  destinations: DestType[];
  filters: string[];
  ids?: string[];
}) => {
  const { destinations, filters, ids = [] } = props;

  if (filters.length === 0) {
    return destinations;
  }

  return destinations.filter((destination) => {
    if (ids.length === 0) {
      return filters.includes(destination.vendorType);
    }

    return (
      filters.includes(destination.vendorType) &&
      ids.includes(destination.vendorName)
    );
  });
};

export const useFilteredDestinations = () => {
  const destinations = useDestinations((state) => state.destinations);
  const filters = useDestinationFilters((state) => state.filters);
  const ids = useDestinationFilters((state) => state.ids);
  const enabled = useDestinationFilters((state) => state.enabled);

  const data = useMemo(() => {
    if (!enabled) {
      return [];
    }

    let _filters = [...filters];

    if (_filters.includes("other")) {
      _filters = [..._filters, ...otherFilters];
    }

    return filterDestinations({ destinations, filters, ids });
  }, [destinations, filters, enabled, ids]);

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
