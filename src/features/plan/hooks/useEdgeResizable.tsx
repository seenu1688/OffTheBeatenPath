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
import { Data } from "@dnd-kit/core";

import {
  ResizeContextProps,
  ResizeMonitorListener,
  ResizeMonitorEvent,
  RegisterListener,
} from "./types";

const createSnapModifier = (
  gridSize: number
): ((delta: { x: number }) => {
  x: number;
}) => {
  return (delta) => {
    return {
      x: Math.round(delta.x / gridSize) * gridSize,
    };
  };
};

const snapModifier = createSnapModifier(5);

const Context = createContext<ResizeContextProps>({});

const ResizeMonitorContext = createContext<RegisterListener | null>(null);

export const useResizeMonitor = (listener: ResizeMonitorListener) => {
  const registerListener = useContext(ResizeMonitorContext);

  useEffect(() => {
    if (!registerListener) {
      throw new Error(
        "useDndMonitor must be used within a children of <DndContext>"
      );
    }

    const unsubscribe = registerListener(listener);

    return unsubscribe;
  }, [listener, registerListener]);
};

const useResizeMonitorProvider = () => {
  const [listeners] = useState(() => new Set<ResizeMonitorListener>());

  const registerListener = useCallback(
    (listener: ResizeMonitorListener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    [listeners]
  );

  const dispatch = useCallback(
    ({ type, event }: ResizeMonitorEvent) => {
      listeners.forEach((listener) => listener[type]?.(event as any));
    },
    [listeners]
  );

  return [dispatch, registerListener] as const;
};

export const ResizeContext = (props: PropsWithChildren<ResizeContextProps>) => {
  const [dispatchMonitorEvent, registerMonitorListener] =
    useResizeMonitorProvider();

  const context = useMemo(() => {
    return {
      onResize: props.onResize,
      modifiers: props.modifiers,
      dispatchMonitorEvent,
    };
  }, []);

  return (
    <ResizeMonitorContext.Provider value={registerMonitorListener}>
      <Context.Provider value={context}>{props.children}</Context.Provider>
    </ResizeMonitorContext.Provider>
  );
};

type Props = {
  id: string;
  data: Data;
};

export const useEdgeResizable = (props: Props) => {
  const [resizeSide, setResizeSide] = useState<"left" | "right" | null>(null);
  const [delta, setDelta] = useState(0);
  const context = useContext(Context);
  const startX = useRef(0);

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const diff = e.clientX - startX.current;

      setDelta(diff);

      context?.dispatchMonitorEvent?.({
        type: "onResize",
        event: {
          id: props.id,
          data: props.data,
          delta: snapModifier({ x: diff }),
          resizeSide,
        },
      });
    },
    [resizeSide]
  );

  const onPointerUp = useCallback(
    (e: PointerEvent) => {
      const diff = e.clientX - startX.current;
      startX.current = 0;

      setDelta(0);

      context?.onResize?.({
        id: props.id,
        data: props.data,
        delta: snapModifier({ x: diff }),
        resizeSide,
      });

      setResizeSide(null);

      context?.dispatchMonitorEvent?.({
        type: "onResizeEnd",
        event: {
          id: props.id,
          data: props.data,
          delta: snapModifier({ x: diff }),
          resizeSide,
        },
      });
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
