import { Data } from "@dnd-kit/core";
import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type ResizeEndEvent = {
  id: string;
  data: Data;
  delta: {
    x: number;
  };
  resizeSide: "left" | "right" | null;
};

type ContextProps = {
  onResize?: (data: ResizeEndEvent) => void;
  modifiers?: any[];
};

const Context = createContext<ContextProps>({});

export const ResizeContext = (props: PropsWithChildren<ContextProps>) => {
  const context = useMemo(() => {
    return {
      onResize: props.onResize,
      modifiers: props.modifiers,
    };
  }, []);

  return <Context.Provider value={context}>{props.children}</Context.Provider>;
};

export const useResizeContext = () => {
  const context = useContext(Context);

  return context;
};

type Props = {
  id: string;
  data: Data;
  onComplete?: () => void;
};

export const useEdgeResizable = (props: Props) => {
  const [resizeSide, setResizeSide] = useState<"left" | "right" | null>(null);
  const [delta, setDelta] = useState(0);
  const context = useResizeContext();
  const startX = useRef(0);

  const onPointerMove = useCallback((e: PointerEvent) => {
    const diff = e.clientX - startX.current;

    setDelta(diff);
  }, []);

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const diff = e.clientX - startX.current;
      startX.current = 0;

      setDelta(0);

      context?.onResize?.({
        id: props.id,
        data: props.data,
        delta: {
          x: diff,
        },
        resizeSide,
      });

      setResizeSide(null);
    },
    [props.id, resizeSide, context]
  );

  const onPointerDown = useCallback(
    (side: "left" | "right", e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      setResizeSide(side);
      startX.current = e.clientX;
    },
    []
  );

  useEffect(() => {
    if (!!resizeSide) {
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [onPointerMove, onPointerUp, resizeSide]);

  return {
    style: !!resizeSide
      ? {
          delta,
        }
      : null,
    listeners: {
      onPointerDown,
    },
    resizeSide,
  };
};
