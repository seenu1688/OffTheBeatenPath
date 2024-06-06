import { Data } from "@dnd-kit/core";
import {
  PointerEventHandler,
  PropsWithChildren,
  createContext,
  useContext,
  useRef,
  useState,
} from "react";

export type ResizeEndEvent = {
  id: string;
  data: Data;
  delta: {
    x: number;
  };
};

type ContextProps = {
  onResize?: (data: ResizeEndEvent) => void;
  modifiers?: any[];
};

const Context = createContext<ContextProps>({});

export const ResizeContext = (props: PropsWithChildren<ContextProps>) => {
  return (
    <Context.Provider
      value={{
        onResize: props.onResize,
        modifiers: props.modifiers,
      }}
    >
      {props.children}
    </Context.Provider>
  );
};

export const useResizeContext = () => {
  const context = useContext(Context);

  return context;
};

type Props = {
  id: string;
  data: Data;
};

export const useEdgeResizable = (props: Props) => {
  const startX = useRef(0);
  const [isResizing, setIsResizing] = useState(false);
  const [width, setWidth] = useState(0);
  const context = useResizeContext();

  const onPointerDown: PointerEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    startX.current = e.clientX;
    setIsResizing(true);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onPointerMove = (e: PointerEvent) => {
    const diff = e.clientX - startX.current;

    setWidth(diff);
  };

  const onPointerUp = (e: PointerEvent) => {
    const diff = e.clientX - startX.current;
    startX.current = 0;

    setIsResizing(false);
    setWidth(0);

    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);

    if (context?.onResize) {
      context!.onResize({
        id: props.id,
        data: props.data,
        delta: {
          x: diff,
        },
      });
    }
  };

  return {
    isResizing,
    style: isResizing
      ? {
          width,
        }
      : null,
    listeners: {
      onPointerDown,
    },
  };
};
