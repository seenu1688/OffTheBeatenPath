"use client";
import { useRef, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { DndContext, DragEndEvent, Modifier } from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  createSnapModifier,
} from "@dnd-kit/modifiers";

import PlannerHeader from "./components/PlannerHeader";
import Timeline from "./components/Timeline";
import GanttView from "./GanttView";
import MapPlanner from "../maps";
import TimelineMonitor from "./TimelineMonitor";

import { usePlanner } from "./hooks/usePlanner";
import { ResizeContext } from "./hooks/useEdgeResizable";

import { cn } from "@/lib/utils";
import { trpcClient } from "@/client";

import { Departure } from "@/common/types";
import { ResizeEvent } from "./hooks/types";

type Props = {
  departure: Departure;
};
const createSnapToDates = (startDate: Date, endDate: Date) => {
  return (args: Parameters<Modifier>[0]) => {
    const data = args.active?.data.current;
    if (data?.position) {
      const { position, width } = data;
      const { x } = args.transform;
      if (x < 0) {
        const delta = position + args.transform.x;

        if (delta < 0) {
          return {
            ...args.transform,
            x: -position,
          };
        }
      } else {
        // check for snapping to end date
        // const delta = position + args.transform.x + width;
        // if (delta > args.rects?.container.width) {
        //   console.log("snap to end date");
        //   return {
        //     ...args.transform,
        //     x: args.rects?.container.width - position - width,
        //   };
        // }
      }
    }

    return {
      ...args.transform,
    };
  };
};

const DeparturePlanner = (props: Props) => {
  const state = usePlanner(props.departure);
  const { dayWidth, startDate, endDate } = state;

  const snapToGrid = createSnapModifier(dayWidth / 24);
  const snapToDates = createSnapToDates(startDate, endDate);

  const { isLoading, error, isError, refetch, isFetching } =
    trpcClient.departures.getSegments.useQuery(props.departure.id);
  const [showPlanner, setShowPlanner] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const utils = trpcClient.useUtils();

  const { mutate: mutateSegment, isPending } =
    trpcClient.segments.update.useMutation({
      onSuccess: () => {
        toast.success("Segment updated");
        refetch();
      },
      onError: () => {
        toast.error("Failed to update segment");
      },
    });
  const { mutate: mutateReservation } =
    trpcClient.reservations.update.useMutation({
      onSuccess: () => {
        toast.success("Updated reservation");
        refetch();
      },
      onError: () => {
        toast.error("Failed to update reservation");
      },
    });

  if (error || isError) return <div>{error.message}</div>;

  const handelDragEnd = (e: DragEndEvent) => {
    scrollRef.current?.style.setProperty("overflow-y", "auto");

    const data = e.active.data.current;
    const startDate = data?.item.startDate;
    const delta = e.delta.x;

    // 4 hours
    if ((delta >= 0 && delta < 40) || (delta <= 0 && delta > -40)) {
      return;
    }

    if (startDate) {
      const hours = Math.round(e.delta.x / (dayWidth / 24));

      const newStartDate = dayjs(startDate).add(hours, "hour");
      const newEndDate = dayjs(data.item.endDate).add(hours, "hour");

      utils.departures.getSegments.setData(props.departure.id, (prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          [data.type]: (prev[data.type] as any[])?.map((segment) => {
            if (segment.id === data.item.id) {
              return {
                ...segment,
                startDate: newStartDate.toISOString(),
                endDate: newEndDate.toISOString(),
              };
            }
            return segment;
          }),
        };
      });

      const reset = () => {
        utils.departures.getSegments.setData(
          props.departure.id,
          (prev: any) => {
            if (!prev) return prev;

            return {
              ...prev,
              [data.type]: (prev[data.type] as any[])?.map((element) => {
                if (element.id === data.item.id) {
                  return {
                    ...element,
                    startDate: startDate,
                    endDate: data.item.endDate,
                  };
                }
                return element;
              }),
            };
          }
        );
      };

      if (data?.type === "segments") {
        mutateSegment(
          {
            segmentId: data.item.id,
            startDateTime: newStartDate.toISOString(),
            endDateTime: newEndDate.toISOString(),
          },
          {
            onError() {
              // revert the changes
              reset();
            },
          }
        );
      } else {
        mutateReservation(
          {
            reservationId: data.item.id,
            startDateTime: newStartDate.toISOString(),
            endDateTime: newEndDate.toISOString(),
          },
          {
            onError() {
              // revert the changes
              reset();
            },
          }
        );
      }
    }
  };

  const handleResize = (e: ResizeEvent) => {
    const data = e.data;
    const endDate = data?.item.endDate;
    const startDate = data?.item.startDate;
    const delta = e.delta.x;

    // 4 hours
    if ((delta >= 0 && delta < 40) || (delta <= 0 && delta > -40)) {
      return;
    }

    if (endDate) {
      const hours = Math.round(delta / (dayWidth / 24));
      const newEndDate =
        e.resizeSide === "right"
          ? dayjs(endDate).add(hours, "hour")
          : dayjs(endDate);
      const newStartDate =
        e.resizeSide === "left"
          ? dayjs(startDate).add(hours, "hour")
          : dayjs(startDate);

      utils.departures.getSegments.setData(props.departure.id, (prev: any) => {
        if (!prev) return prev;

        return {
          ...prev,
          [data.type]: (prev[data.type] as any[])?.map((element) => {
            if (element.id === data.item.id) {
              return {
                ...element,
                endDate: newEndDate.toISOString(),
                startDate: newStartDate.toISOString(),
              };
            }
            return element;
          }),
        };
      });

      const reset = () => {
        utils.departures.getSegments.setData(
          props.departure.id,
          (prev: any) => {
            if (!prev) return prev;

            return {
              ...prev,
              [data.type]: (prev[data.type] as any[])?.map((element) => {
                if (element.id === data.item.id) {
                  return {
                    ...element,
                    startDate: startDate,
                    endDate: data.item.endDate,
                  };
                }
                return element;
              }),
            };
          }
        );
      };

      if (data?.type === "segments") {
        mutateSegment(
          {
            segmentId: data.item.id,
            startDateTime: newStartDate.toISOString(),
            endDateTime: newEndDate.toISOString(),
          },
          {
            onError() {
              // revert the changes
              reset();
            },
          }
        );
      } else {
        mutateReservation(
          {
            reservationId: data.item.id,
            startDateTime: newStartDate.toISOString(),
            endDateTime: newEndDate.toISOString(),
          },
          {
            onError() {
              // revert the changes
              reset();
            },
          }
        );
      }
    }
  };

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

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis, snapToGrid, snapToDates]}
      onDragEnd={handelDragEnd}
      onDragStart={(e) => {
        scrollRef.current?.style.setProperty("overflow-y", "hidden");
      }}
    >
      <ResizeContext onResize={handleResize}>
        <div className="relative overflow-hidden">
          {<PlannerHeader departure={props.departure} />}
          <div className={cn("h-[calc(100vh-66px)] overflow-y-hidden")}>
            <div
              className={cn(
                "relative grid h-auto grid-rows-[60px_1fr]",
                "w-full overflow-x-auto overflow-y-auto",
                showPlanner ? "visible h-[70%]" : "invisible h-0"
              )}
              ref={scrollRef}
            >
              <Timeline departure={props.departure} state={state} />
              <GanttView state={state} departure={props.departure} />
              <TimelineMonitor
                departure={props.departure}
                getScrollPosition={getScrollPosition}
              />
            </div>
            <div
              className={cn(
                "relative h-[30%] w-full",
                !showPlanner && "h-full"
              )}
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
          {(isFetching || isPending) && (
            <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex h-full w-full items-center justify-center bg-gray-600/20">
              <Loader2 size={36} className="animate-spin text-orange-500" />
            </div>
          )}
        </div>
      </ResizeContext>
    </DndContext>
  );
};

export default DeparturePlanner;
