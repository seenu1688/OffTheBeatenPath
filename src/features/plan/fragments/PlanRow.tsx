import { PopoverArrow, PopoverPortal } from "@radix-ui/react-popover";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/popover";
import ReservationPopoverCard from "./ReservationPopoverCard";

import { PlannerState } from "../hooks/usePlanner";

import { useDeparture } from "../hooks/useDeparture";

import { getItemPlacement } from "../helpers";

import { PlanType } from "../constants";

import { DeparturesResponse } from "@/common/types";

type Props = {
  plan: PlanType;
  data: DeparturesResponse;
  state: PlannerState;
};

const PlanRow = ({ plan, data, state }: Props) => {
  const gridData = useDeparture<
    DeparturesResponse[(typeof plan)["id"]][number]
  >(data[plan.id] ?? []);

  return (
    <div
      className="relative grid min-h-16 w-full border-b-1.5 border-b-[#C59D89]"
      key={plan.id}
      style={{
        gridTemplateColumns: `${state.dayWidth}px 50px 1fr ${state.dayWidth}px`,
      }}
    >
      <div className="sticky left-0 z-10 h-full  bg-[#EAEADD] py-2">
        <div className="flex h-full items-center gap-2 px-10">
          {<plan.Icon size={20} />}
          {plan.title}
        </div>
      </div>
      <div className="w-full"></div>
      <div className="flex flex-col py-2">
        {gridData.map((line, index) => {
          return (
            <div key={index} className="relative flex h-[40px] items-center">
              {line.map((segment, i) => {
                const { position, width, ...rest } = getItemPlacement(
                  segment,
                  { startDate: state.startDate, endDate: state.endDate },
                  state.dayWidth
                );

                const children = (
                  <div
                    style={{
                      width: `${width}px`,
                      transform: `translateX(${position}px)`,
                      background: plan.accentColor,
                      borderColor: plan.primaryColor,
                    }}
                    key={segment.id}
                    className="z-1 absolute cursor-pointer rounded-sm border-1.5  px-3 py-1 text-left text-xs"
                  >
                    <div
                      title={segment.name}
                      className="w-auto overflow-hidden text-ellipsis whitespace-nowrap"
                    >
                      {segment.name}
                    </div>
                  </div>
                );

                if (plan.id === "segments" || plan.id === "destinations") {
                  return children;
                }

                return (
                  <Popover key={segment.id}>
                    <PopoverTrigger asChild>{children}</PopoverTrigger>
                    <PopoverPortal>
                      <PopoverContent className="w-[350px] border border-orange-500 shadow-md">
                        <ReservationPopoverCard reservationId={segment.id} />
                        <PopoverArrow fill="#fff" className="drop-shadow" />
                      </PopoverContent>
                    </PopoverPortal>
                  </Popover>
                );
              })}
            </div>
          );
        })}
      </div>
      <div></div>
    </div>
  );
};

export default PlanRow;
