import { useMemo } from "react";
import dayjs from "dayjs";
import { Luggage } from "lucide-react";

import { Dialog, DialogContent, DialogTrigger } from "@/components/dialog";
import GridLineLabel from "./GridLineLabel";
import InfoDialog from "./InfoDialog";

import { PlannerState } from "../hooks/usePlanner";

import { cn } from "@/lib/utils";

import { Departure } from "@/common/types";

type Props = {
  state: PlannerState;
  departure: Departure;
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
  const { dayWidth, startDate, endDate, width, dayCount } = props.state;

  const ranges = useMemo(
    () => getDateRanges(startDate, endDate),
    [startDate, endDate]
  );

  return (
    <div
      className="sticky top-0 z-20 h-full w-full bg-white"
      style={{
        width: `${width}px`,
      }}
    >
      <div
        className="relative grid h-full w-full border-b-2 border-[#C59D89] text-sm last:border-b-0"
        style={{
          gridTemplateColumns: `${dayWidth}px 50px repeat(${ranges.length}, ${dayWidth}px)`,
        }}
      >
        <div className="sticky left-0 z-50 h-full w-full"></div>
        <div className="sticky left-0 z-50 h-full w-full"></div>
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
      <Dialog>
        <DialogTrigger>
          <GridLineLabel
            className={cn("absolute bottom-[5px] -translate-x-[48%]")}
            style={{
              left: `${dayWidth + 45}px`,
            }}
            label="Arrival"
            icon={<Luggage size={14} />}
          />
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <InfoDialog departure={props.departure} type="arrival" />
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger>
          <GridLineLabel
            className={cn("absolute bottom-[5px] -translate-x-1/2")}
            style={{
              left: `${dayCount * dayWidth + 46}px`,
            }}
            label="Departure"
            icon={<Luggage size={14} />}
          />
        </DialogTrigger>
        <DialogContent className="max-w-xl">
          <InfoDialog departure={props.departure} type="departure" />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timeline;
