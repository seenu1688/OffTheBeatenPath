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
  const [showMap, setShowMap] = useState(false);

  return (
    <div className="relative overflow-hidden">
      <PlannerHeader departure={props.departure} />
      <div className={cn("h-[calc(100vh-64px)] overflow-y-hidden")}>
        <div
          className={cn(
            "relative grid h-auto grid-rows-[60px_1fr]",
            "duration-400 h-full w-full overflow-x-auto overflow-y-auto transition-all ease-in-out",
            showMap && "h-[50vh]"
          )}
        >
          <Timeline state={state} />
          <GanttView state={state} departureId={props.departure.id} />
          <button
            title="Open Map"
            aria-label="Toggle Map"
            className={cn(
              "absolute bottom-5 right-5 z-[10] duration-200 ease-in-out",
              "cursor-pointer rounded-sm bg-primary px-2 py-1 text-primary-foreground shadow-md"
            )}
            data-state={showMap ? "open" : "closed"}
            onClick={setShowMap.bind(null, !showMap)}
          >
            {showMap ? <ChevronDown /> : <ChevronUp />}
          </button>
        </div>
        <div
          className={cn(
            "duration-400 w-full transition-all ease-in-out",
            showMap ? "visible h-full" : "invisible h-0"
          )}
        >
          <MapPlanner />
        </div>
      </div>
    </div>
  );
};

export default DeparturePlanner;
