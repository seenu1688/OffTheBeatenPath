"use client";

import PlannerHeader from "./components/PlannerHeader";
import Timeline from "./components/Timeline";
import GanttView from "./GanttView";

import { usePlanner } from "./hooks/usePlanner";

import { cn } from "@/lib/utils";

import { Departure } from "@/common/types";

type Props = {
  departure: Departure;
};

const DeparturePlanner = (props: Props) => {
  const state = usePlanner(props.departure);

  return (
    <div className="overflow-hidden">
      <PlannerHeader departure={props.departure} />
      <div
        className={cn(
          "grid h-auto grid-rows-[48px_1fr]",
          "overflow-x-auto overflow-y-hidden"
        )}
      >
        <Timeline state={state} />
        <GanttView state={state} />
      </div>
    </div>
  );
};

export default DeparturePlanner;
