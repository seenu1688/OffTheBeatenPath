import PlanLineItem from "./PlanLineItem";

import { PlannerState } from "../hooks/usePlanner";
import { useDeparture } from "../hooks/useDeparture";

import { getItemPlacement } from "../helpers";

import { PlanType } from "../constants";

import { DeparturesResponse } from "@/common/types";

type Props = {
  plan: PlanType;
  data: DeparturesResponse;
  state: PlannerState;
  departureId: string;
};

const PlanRow = ({ plan, data, state, departureId }: Props) => {
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
              {line.map((lineItem) => {
                const { position, width } = getItemPlacement(
                  lineItem,
                  { startDate: state.startDate, endDate: state.endDate },
                  state.dayWidth
                );

                return (
                  <PlanLineItem
                    key={lineItem.id}
                    item={lineItem}
                    plan={plan}
                    width={width}
                    position={position}
                    departureId={departureId}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
      <div className="w-full"></div>
    </div>
  );
};

export default PlanRow;
