"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import PlannerHeader from "./components/PlannerHeader";
import Timeline from "./components/Timeline";
import GanttView from "./GanttView";
import MapPlanner from "../maps";

import { usePlanner } from "./hooks/usePlanner";

import { cn } from "@/lib/utils";

import { Departure } from "@/common/types";

type Props = {
  departure: Departure;
};

const DeparturePlanner = (props: Props) => {
  const state = usePlanner(props.departure);
  const [showPlanner, setShowPlanner] = useState(true);

  return (
    <div className="relative overflow-hidden">
      {showPlanner && <PlannerHeader departure={props.departure} />}
      <div
        className={cn(
          "h-[calc(100vh-64px)] overflow-y-hidden",
          !showPlanner && "h-[100vh]"
        )}
      >
        <div
          className={cn(
            "relative grid h-auto grid-rows-[60px_1fr]",
            "w-full overflow-x-auto overflow-y-auto",
            showPlanner ? "visible h-[50%]" : "invisible h-0"
          )}
        >
          <Timeline state={state} />
          <GanttView state={state} departureId={props.departure.id} />
        </div>
        <div
          className={cn("relative h-[50%] w-full", !showPlanner && "h-full")}
        >
          <button
            title="Toggle Planner"
            aria-label="Toggle Planner"
            className={cn(
              "absolute right-10 top-10 z-[10] h-10 duration-200 ease-in-out data-[state=open]:bottom-1/2",
              "cursor-pointer rounded-sm bg-primary px-2 py-1 text-primary-foreground shadow-md"
            )}
            data-state={showPlanner ? "open" : "closed"}
            onClick={setShowPlanner.bind(null, !showPlanner)}
          >
            {showPlanner ? <ChevronUp /> : <ChevronDown />}
          </button>
          <MapPlanner />
        </div>
      </div>
    </div>
  );
};

export default DeparturePlanner;
