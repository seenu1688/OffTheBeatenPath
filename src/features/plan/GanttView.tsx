import { DndContext, Modifier } from "@dnd-kit/core";
import {
  restrictToHorizontalAxis,
  createSnapModifier,
} from "@dnd-kit/modifiers";
import dayjs from "dayjs";
import { toast } from "sonner";

import GridTileArea from "./components/GridTileArea";
import GridLines from "./components/GridLines";
import PlanRow from "./fragments/PlanRow";

import Loader from "@/components/Loader";

import { PlannerState } from "./hooks/usePlanner";

import { trpcClient } from "@/client";

import { tripPlans } from "./constants";

type Props = {
  state: PlannerState;
  departureId: string;
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

const GanttView = (props: Props) => {
  const { width, dayWidth, dayCount, startDate, endDate } = props.state;
  const snapToGrid = createSnapModifier(dayWidth / 24);
  const snapToDates = createSnapToDates(startDate, endDate);

  const { data, isLoading, refetch } =
    trpcClient.departures.getSegments.useQuery(props.departureId);
  const { mutate: mutateSegment } = trpcClient.segments.update.useMutation({
    onSuccess: () => {
      toast.success("Segment updated");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update segment");
    },
  });

  if (isLoading || !data) return <Loader />;

  return (
    <DndContext
      modifiers={[restrictToHorizontalAxis, snapToGrid, snapToDates]}
      onDragEnd={(e) => {
        const data = e.active.data.current;
        const startDate = data?.item.startDate;
        const delta = e.delta.x;

        // 4 hours
        if ((delta >= 0 && delta < 40) || (delta <= 0 && delta > -40)) {
          return;
        }

        if (data?.type === "segments") {
          if (startDate) {
            const hours = Math.round(e.delta.x / (dayWidth / 24));

            const newStartDate = dayjs(startDate).add(hours, "hour");
            const newEndDate = dayjs(data.item.endDate).add(hours, "hour");
            console.log({
              newStartDate: newStartDate.toDate(),
              newEndDate: newEndDate.toDate(),
              startDate: new Date(startDate),
              delta: e.delta.x,
              position: data?.position,
            });

            mutateSegment({
              segmentId: data.item.id,
              startDateTime: newStartDate.toISOString(),
              endDateTime: newEndDate.toISOString(),
            });
          }
        }
      }}
    >
      <div
        style={{
          width: `${width}px`,
        }}
        className="relative h-full select-none"
      >
        {tripPlans.map((plan) => {
          return (
            <PlanRow
              key={plan.id}
              departureId={props.departureId}
              state={props.state}
              plan={plan}
              data={data}
            />
          );
        })}
        <GridTileArea count={dayCount} />
        <GridLines state={props.state} />
      </div>
    </DndContext>
  );
};

export default GanttView;
