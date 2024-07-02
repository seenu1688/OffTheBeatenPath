import { create } from "zustand";

export const useDataStore = create<{
  data: string[];
  setData: (data: string[]) => void;
}>((set) => ({
  data: [] as string[],
  setData: (data: string[]) => {
    set({ data });
  },
}));
