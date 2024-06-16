"use client";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";

import PlannerHeader from "./components/PlannerHeader";
import Timeline from "./components/Timeline";
import GanttView from "./GanttView";
import MapPlanner from "../maps";
import TimelineMonitor from "./TimelineMonitor";

import PlanProviders from "./PlanProviders";
import { usePlanner } from "./hooks/usePlanner";

import { cn } from "@/lib/utils";
import { trpcClient } from "@/client";

import { Departure } from "@/common/types";
import { usePlanResizer } from "./usePlanResizer";

type Props = {
  departure: Departure;
};

const DeparturePlanner = (props: Props) => {
  const state = usePlanner(props.departure);
  const { resizeRef, listeners, planHeight, totalHeight } = usePlanResizer();

  const { error, isError, refetch, isFetching } =
    trpcClient.departures.getSegments.useQuery(props.departure.id);
  const [showPlanner, setShowPlanner] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getScrollPosition = () => {
    if (!scrollRef.current)
      return {
        x: 0,
        y: 0,
      };

    return {
      x: scrollRef.current.scrollLeft,
      y: scrollRef.current.scrollTop,
    };
  };

  if (error || isError) return <div>{error.message}</div>;

  // const totalHeight = window.innerHeight - 66;
  // const initialPlanHeight = totalHeight * 0.7;
  // let planHeight = initialPlanHeight + delta;

  // if (planHeight < 200) {
  //   planHeight = 200;
  // } else if (planHeight > initialPlanHeight) {
  //   planHeight = initialPlanHeight;
  // }

  return (
    <PlanProviders
      departure={props.departure}
      onSuccess={refetch}
      state={state}
      toggleScrollLock={() => {
        scrollRef.current?.style.setProperty("overflow-y", "auto");
      }}
    >
      <div className="relative select-none overflow-hidden">
        {<PlannerHeader departure={props.departure} />}
        <div className={cn("h-[calc(100vh-66px)] overflow-y-hidden")}>
          <div
            className={cn(
              "relative grid h-auto grid-rows-[60px_1fr]",
              "custom-scroll w-full overflow-x-auto overflow-y-auto",
              showPlanner ? "visible h-[70%]" : "invisible h-0"
            )}
            style={
              showPlanner
                ? {
                    height: planHeight,
                  }
                : {}
            }
            ref={scrollRef}
          >
            <Timeline departure={props.departure} state={state} />
            <GanttView state={state} departure={props.departure} />
            <TimelineMonitor
              departure={props.departure}
              getScrollPosition={getScrollPosition}
            />
          </div>
          {showPlanner && (
            <div
              ref={resizeRef}
              {...listeners}
              className="h-[4px] w-full cursor-row-resize bg-transparent"
            />
          )}
          <div
            className={cn("relative h-[30%] w-full", !showPlanner && "h-full")}
            style={
              showPlanner
                ? {
                    height: totalHeight - planHeight,
                  }
                : {}
            }
          >
            <button
              title="Toggle Planner"
              aria-label="Toggle Planner"
              className={cn(
                "absolute right-10 top-10 z-[10] h-10 duration-200 ease-in-out data-[state=open]:bottom-1/2",
                "cursor-pointer rounded-sm bg-primary px-2 py-1 text-primary-foreground shadow-md"
              )}
              data-state={showPlanner ? "open" : "closed"}
              onClick={() => {
                setShowPlanner((prevShowPlanner) => !prevShowPlanner);
              }}
            >
              {showPlanner ? <ChevronUp /> : <ChevronDown />}
            </button>
            <MapPlanner departure={props.departure} />
          </div>
        </div>
        {isFetching && (
          <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex h-full w-full items-center justify-center bg-gray-600/20">
            <Loader2 size={36} className="animate-spin text-orange-500" />
          </div>
        )}
      </div>
    </PlanProviders>
  );
};

export default DeparturePlanner;
