import { Data } from "@dnd-kit/core";

export type ResizeEvent = {
  id: string;
  data: Data;
  delta: {
    x: number;
  };
  resizeSide: "left" | "right" | null;
};

export type ResizeContextProps = {
  onResize?: (data: ResizeEvent) => void;
  onResizeEnd?: (data: ResizeEvent) => void;
  modifiers?: any[];
  dispatchMonitorEvent?: (event: ResizeMonitorEvent) => void;
};

export type ResizeMonitorListener = {
  onResizeStart?(event: ResizeEvent): void;
  onResize?(event: ResizeEvent): void;
  onResizeEnd?(event: ResizeEvent): void;
};

export type ResizeMonitorEvent = {
  type: keyof ResizeMonitorListener;
  event: ResizeEvent;
};

export type UnregisterListener = () => void;

export type RegisterListener = (
  listener: ResizeMonitorListener
) => UnregisterListener;
