import { useMemo, useRef, useState } from "react";
import { useDndMonitor } from "@dnd-kit/core";
import dayjs from "dayjs";
import { Luggage } from "lucide-react";

import GridLineLabel from "./components/GridLineLabel";

import { useResizeMonitor } from "./hooks/useEdgeResizable";

import { cn } from "@/lib/utils";

import { Departure } from "@/common/types";

const TimelineMonitor = ({
  departure,
  getScrollPosition,
}: {
  departure: Departure;
  getScrollPosition: () => {
    x: number;
    y: number;
  };
}) => {
  const [range, setRange] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({ startDate: null, endDate: null });
  const dayWidth = 240;
  const hourWidth = dayWidth / 24;

  useDndMonitor({
    onDragMove(e) {
      const data = e.active.data.current;
      const startDate = data?.item.startDate;
      const delta = e.delta.x;

      if (startDate) {
        const hours = delta / hourWidth;
        const newStartDate = dayjs(startDate).add(hours, "hour");
        const newEndDate = dayjs(data.item.endDate).add(hours, "hour");

        setRange({
          startDate: newStartDate.toDate(),
          endDate: newEndDate.toDate(),
        });
      }
    },
    onDragEnd() {
      setRange({
        startDate: null,
        endDate: null,
      });
    },
  });

  useResizeMonitor({
    onResize(e) {
      const data = e.data;
      const startDate = data.item.startDate;
      const endDate = data.item.endDate;
      const delta = e.delta.x;

      const hours = delta / hourWidth;

      const newEndDate =
        e.resizeSide === "right"
          ? dayjs(endDate).add(hours, "hour")
          : dayjs(endDate);
      const newStartDate =
        e.resizeSide === "left"
          ? dayjs(startDate).add(hours, "hour")
          : dayjs(startDate);

      setRange({
        startDate: newStartDate.toDate(),
        endDate: newEndDate.toDate(),
      });
    },
    onResizeEnd() {
      setRange({
        startDate: null,
        endDate: null,
      });
    },
  });

  if (!range.startDate || !range.endDate) return null;

  const diff = Math.abs(
    dayjs(range.startDate).diff(
      dayjs(departure.startDate).startOf("day"),
      "hour",
      true
    )
  );
  const width =
    Math.abs(dayjs(range.endDate).diff(range.startDate, "hour", true)) *
    hourWidth;
  const position = diff * hourWidth + 240;
  const { x, y } = getScrollPosition();

  return (
    <>
      <GridLineLabel
        className={cn("fixed top-[90px] -translate-x-[50%]")}
        style={{
          left: `${position - x}px`,
          zIndex: 100,
        }}
        label={dayjs(range.startDate).format("DD MMM YYYY hh:mm A")}
        icon={<Luggage size={14} />}
      />
      <div
        className="absolute z-[100] h-full -translate-x-1/2 bg-black text-white"
        style={{
          top: 60 + y,
          left: `${position}px`,
          width: 2,
        }}
      />
      <GridLineLabel
        className={cn("fixed top-[90px] -translate-x-[50%]")}
        style={{
          left: `${position + width - x}px`,
          zIndex: 100,
        }}
        label={dayjs(range.endDate).format("DD MMM YYYY hh:mm A")}
        icon={<Luggage size={14} />}
      />
      <div
        className="absolute z-[100] h-full -translate-x-1/2 bg-black text-white"
        style={{
          top: 60 + y,
          left: `${position + width}px`,
          width: 2,
        }}
      />
    </>
  );
};

export default TimelineMonitor;
