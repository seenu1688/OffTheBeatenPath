import { PropsWithChildren } from "react";
import {
  createSnapModifier,
  restrictToHorizontalAxis,
} from "@dnd-kit/modifiers";
import { toast } from "sonner";
import dayjs from "dayjs";
import { DndContext, DragEndEvent, Modifier } from "@dnd-kit/core";
import { Loader2 } from "lucide-react";

import { PlannerState } from "./hooks/usePlanner";
import { ResizeContext } from "./hooks/useEdgeResizable";

import { trpcClient } from "@/client";

import { ResizeEvent } from "./hooks/types";
import { Departure } from "@/common/types";

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

type Props = {
  onSuccess: () => void;
  state: PlannerState;
  departure: Departure;
  toggleScrollLock: () => void;
};

const PlanProviders = (props: PropsWithChildren<Props>) => {
  const { dayWidth } = props.state;
  const utils = trpcClient.useUtils();

  const { mutate: mutateSegment, isPending } =
    trpcClient.segments.update.useMutation({
      onSuccess: () => {
        toast.success("Segment updated");
        props.onSuccess();
      },
      onError: () => {
        toast.error("Failed to update segment");
      },
    });
  const { mutate: mutateReservation } =
    trpcClient.reservations.update.useMutation({
      onSuccess: () => {
        toast.success("Updated reservation");
        props.onSuccess();
      },
      onError: () => {
        toast.error("Failed to update reservation");
      },
    });
  const snapToGrid = createSnapModifier(5);

  const handelDragEnd = (e: DragEndEvent) => {
    // scrollRef.current?.style.setProperty("overflow-y", "auto");
    props.toggleScrollLock();

    const data = e.active.data.current;
    const startDate = data?.item.startDate;
    const delta = e.delta.x;

    if ((delta >= 0 && delta < 5) || (delta <= 0 && delta > -5)) {
      return;
    }

    if (startDate) {
      const hours = e.delta.x / (dayWidth / 24);

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

    if ((delta >= 0 && delta < 5) || (delta <= 0 && delta > -5)) {
      return;
    }

    if (endDate) {
      const hours = delta / (dayWidth / 24);
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

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis, snapToGrid]}
      onDragEnd={handelDragEnd}
      onDragStart={(e) => {
        // scrollRef.current?.style.setProperty("overflow-y", "hidden");
        props.toggleScrollLock();
      }}
    >
      <ResizeContext onResize={handleResize}>
        {props.children}
        {isPending && (
          <div className="fixed bottom-0 left-0 right-0 top-0 z-[100] flex h-full w-full items-center justify-center bg-gray-600/20">
            <Loader2 size={36} className="animate-spin text-orange-500" />
          </div>
        )}
      </ResizeContext>
    </DndContext>
  );
};

export default PlanProviders;
