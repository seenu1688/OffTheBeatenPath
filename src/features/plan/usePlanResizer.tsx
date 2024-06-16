import { useCallback, useEffect, useRef, useState } from "react";

const MINIMUM_PLAN_HEIGHT = 200;

export const usePlanResizer = () => {
  const resizeRef = useRef<HTMLDivElement>(null);
  const currentPageY = useRef<number | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const totalHeight = window.innerHeight - 66;
  const initialPlanHeight = totalHeight * 0.7;
  const [planHeight, setPlanHeight] = useState(initialPlanHeight);

  const onPointerDown: React.PointerEventHandler = (e) => {
    currentPageY.current = e.pageY;
    setIsResizing(true);
  };

  const onMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!currentPageY.current) return;

      const delta = e.pageY - currentPageY.current;

      setPlanHeight((prevheight) => {
        let height = prevheight + delta;

        if (height < MINIMUM_PLAN_HEIGHT) {
          height = MINIMUM_PLAN_HEIGHT;
        } else if (height > initialPlanHeight) {
          height = initialPlanHeight;
        }

        return height;
      });

      currentPageY.current = e.pageY;
    },
    [initialPlanHeight]
  );

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
  }, [isResizing, onMouseMove, onMouseUp]);

  return {
    resizeRef,
    listeners: {
      onPointerDown: onPointerDown,
    },
    planHeight,
    totalHeight,
  };
};
