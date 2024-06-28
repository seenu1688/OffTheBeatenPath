import GridTileArea from "./components/GridTileArea";
import GridLines from "./components/GridLines";
import PlanRow from "./fragments/PlanRow";
import Loader from "@/components/Loader";

import { PlannerState } from "./hooks/usePlanner";

import { trpcClient } from "@/client";

import { tripPlans } from "./constants";

import { Departure } from "@/common/types";

type Props = {
  state: PlannerState;
  departure: Departure;
};

const GanttView = (props: Props) => {
  const { width, dayCount } = props.state;

  const { data } = trpcClient.departures.getSegments.useQuery(
    props.departure.id
  );

  return (
    <>
      <div
        style={{
          width: `${width}px`,
        }}
        className="relative h-full w-full select-none"
      >
        {tripPlans.map((plan) => {
          return (
            <PlanRow
              key={plan.id}
              departure={props.departure}
              state={props.state}
              plan={plan}
              data={data}
            />
          );
        })}
        <GridTileArea count={dayCount} />
        <GridLines state={props.state} />
      </div>
    </>
  );
};

export default GanttView;
