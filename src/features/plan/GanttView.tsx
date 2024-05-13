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

const GanttView = (props: Props) => {
  const { width, dayWidth, dayCount } = props.state;

  const { data, isLoading } = trpcClient.departures.getSegments.useQuery(
    props.departureId
  );

  if (isLoading || !data) return <Loader />;

  return (
    <div
      style={{
        width: `${width}px`,
      }}
      className="relative h-full select-none"
    >
      {tripPlans.map((plan) => {
        return (
          <PlanRow key={plan.id} state={props.state} plan={plan} data={data} />
        );
      })}
      <GridTileArea count={dayCount} />
      <GridLines dayWidth={dayWidth} />
    </div>
  );
};

export default GanttView;
