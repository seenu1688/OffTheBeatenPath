import { useMemo } from "react";
import dayjs from "dayjs";
import { Luggage } from "lucide-react";

import GridLineLabel from "./GridLineLabel";

import { cn } from "@/lib/utils";
import { PlannerState } from "../hooks/usePlanner";

type Props = {
  state: PlannerState;
};

const getDateRanges = (startDate: Date, endDate: Date) => {
  const ranges = [];
  let currentDate = startDate;

  while (currentDate <= endDate) {
    ranges.push({
      currentDate,
      id: dayjs(currentDate).format("YYYY-MM-DD"),
    });
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return ranges;
};

const Timeline = (props: Props) => {
  const { dayWidth, startDate, endDate, width } = props.state;

  const ranges = useMemo(
    () => getDateRanges(startDate, endDate),
    [startDate, endDate]
  );

  return (
    <div
      className="relative h-full w-full"
      style={{
        width: `${width}px`,
      }}
    >
      <div
        className="relative grid h-full w-full border-b-2 border-[#C59D89] text-sm"
        style={{
          gridTemplateColumns: `repeat(${ranges.length + 1}, ${dayWidth}px)`,
        }}
      >
        <div className="sticky left-0 h-full w-full "></div>
        {ranges.map((date) => (
          <div
            key={date.id}
            className="flex h-full w-full flex-col items-center justify-between pt-1"
          >
            <div>{dayjs(date.currentDate).format("DD MMM YYYY")}</div>
            <div className="h-3 w-[2px] bg-[#707070]"></div>
          </div>
        ))}
      </div>
      <GridLineLabel
        className={cn("absolute bottom-[5px] -translate-x-[48%]")}
        style={{
          left: `${dayWidth}px`,
        }}
        label="Arrival"
        icon={<Luggage size={14} />}
      />
      <GridLineLabel
        className={cn("absolute bottom-[5px] -translate-x-1/2")}
        style={{
          left: `${width - dayWidth}px`,
        }}
        label="Departure"
        icon={<Luggage size={14} />}
      />
    </div>
  );
};

export default Timeline;
