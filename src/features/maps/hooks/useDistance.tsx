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
  addMeta: (id: string, meta: Meta) => void;
  removeMeta: (id: string) => void;
};

export const useDistance = create<DistanceState>((set) => {
  return {
    distances: new Map(),
    addMeta: (id: string, meta: Meta) => {
      set((state) => {
        return {
          distances: new Map(state.distances.set(id, meta)),
        };
      });
    },
    removeMeta: (id: string) => {
      set((state) => {
        state.distances.delete(id);
        return {
          distances: state.distances,
        };
      });
    },
  };
});
