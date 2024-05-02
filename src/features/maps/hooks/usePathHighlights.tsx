import { create } from "zustand";

type PathHighlight = {
  highlightId: string | null;
  setHighlightId: (highlightId: string | null) => void;
};

export const usePathHighlights = create<PathHighlight>((set) => {
  return {
    highlightId: null,
    setHighlightId: (highlightId: string | null) => {
      set({
        highlightId,
      });
    },
  };
});
