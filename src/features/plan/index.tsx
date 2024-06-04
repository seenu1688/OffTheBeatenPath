"use client";
import { useRef, useState } from "react";
import { ChevronDown, ChevronUp, Loader2, Luggage } from "lucide-react";
import {
  restrictToHorizontalAxis,
  createSnapModifier,
} from "@dnd-kit/modifiers";

import PlannerHeader from "./components/PlannerHeader";
import Timeline from "./components/Timeline";
import GanttView from "./GanttView";
import MapPlanner from "../maps";
import Loader from "@/components/Loader";

import { usePlanner } from "./hooks/usePlanner";

import { cn } from "@/lib/utils";
import { trpcClient } from "@/client";

import { Departure } from "@/common/types";
import dayjs from "dayjs";
import {
  DndContext,
  DragEndEvent,
  Modifier,
  useDndMonitor,
} from "@dnd-kit/core";
import { toast } from "sonner";
import GridLineLabel from "./components/GridLineLabel";

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

      if (data?.type === "segments") {
        mutateSegment({
          segmentId: data.item.id,
          startDateTime: newStartDate.toISOString(),
          endDateTime: newEndDate.toISOString(),
        });
      } else {
        mutateReservation({
          reservationId: data.item.id,
          startDateTime: newStartDate.toISOString(),
          endDateTime: newEndDate.toISOString(),
        });
      }
    }
  };

  const getScrollPosition = () => {
    if (!scrollRef.current) return 0;

    return scrollRef.current.scrollLeft;
  };

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis, snapToGrid, snapToDates]}
      onDragEnd={handelDragEnd}
    >
      <div className="relative overflow-hidden">
        {<PlannerHeader departure={props.departure} />}
        <div className={cn("h-[calc(100vh-66px)] overflow-y-hidden")}>
          {isLoading ? (
            <Loader />
          ) : (
            <div
              className={cn(
                "relative grid h-auto grid-rows-[60px_1fr]",
                "w-full overflow-x-auto overflow-y-auto",
                showPlanner ? "visible h-[70%]" : "invisible h-0"
              )}
              ref={scrollRef}
            >
              <Timeline state={state} />
              <GanttView state={state} departure={props.departure} />
              <TimelineMonitor
                departure={props.departure}
                getScrollPosition={getScrollPosition}
              />
            </div>
          )}
          <div
            className={cn("relative h-[30%] w-full", !showPlanner && "h-full")}
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
    </DndContext>
  );
};

const TimelineMonitor = ({
  departure,
  getScrollPosition,
}: {
  departure: Departure;
  getScrollPosition: () => number;
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

  return (
    <>
      <GridLineLabel
        className={cn("fixed top-[90px] -translate-x-[50%]")}
        style={{
          left: `${position - getScrollPosition()}px`,
          zIndex: 100,
        }}
        label={dayjs(range.startDate).format("DD MMM YYYY hh:mm A")}
        icon={<Luggage size={14} />}
      />
      <div
        className="absolute z-[100] h-full -translate-x-1/2 bg-black text-white"
        style={{
          top: 0,
          left: `${position}px`,
          width: 2,
        }}
      />
    </>
  );
};

export default DeparturePlanner;
