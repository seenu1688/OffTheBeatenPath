import { create } from "zustand";

type Meta = {
  distance?: {
    text: string;
    value: number;
  };
  duration?: {
    text: string;
    value: number;
  };
};

export type DistanceState = {
  distances: Map<string, Meta>;
  setDistance: (id: string, meta: Meta) => void;
};

export const useDistance = create<DistanceState>((set) => {
  return {
    distances: new Map(),
    setDistance: (id: string, meta: Meta) => {
      set((state) => {
        return {
          distances: new Map(state.distances.set(id, meta)),
        };
      });
    },
  };
});
