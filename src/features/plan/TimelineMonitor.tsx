import { useState } from "react";
import { useDndMonitor } from "@dnd-kit/core";
import dayjs from "dayjs";
import { Luggage } from "lucide-react";

import GridLineLabel from "./components/GridLineLabel";

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

  useDndMonitor({
    onDragMove(e) {
      const data = e.active.data.current;
      const startDate = data?.item.startDate;
      const delta = e.delta.x;

      if (startDate) {
        const hours = Math.round(delta / (dayWidth / 24));
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

  if (!range.startDate || !range.endDate) return null;

  const diff = Math.abs(
    dayjs(range.startDate).diff(departure.startDate, "hour")
  );
  const hourWidth = dayWidth / 24;
  const position = diff * hourWidth + 290;
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
    </>
  );
};

export default TimelineMonitor;
