import { useCallback, useEffect, useRef, useState } from "react";

export const usePlanResizer = () => {
  const resizeRef = useRef<HTMLDivElement>(null);
  const currentPageY = useRef<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const [delta, setDelta] = useState(0);

  const onPointerDown: React.PointerEventHandler = (e) => {
    currentPageY.current = e.pageY;
    setIsResizing(true);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!currentPageY.current) return;

    const delta = e.pageY - currentPageY.current;
    setDelta(delta);
  };

  const onMouseUp = useCallback(() => {
    currentPageY.current = null;
  }, []);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("pointermove", onMouseMove);
      window.addEventListener("pointerup", onMouseUp);
    }

    return () => {
      window.removeEventListener("pointermove", onMouseMove);
      window.removeEventListener("pointerup", onMouseUp);
    };
  }, [isResizing, onMouseUp]);

  return {
    resizeRef,
    listeners: {
      onPointerDown: onPointerDown,
    },
    delta,
  };
};
