import { tripPlans } from "./constants";

import { PlannerState } from "./hooks/usePlanner";

type Props = {
  state: PlannerState;
};

const GridTileArea = (props: { count: number }) => {
  return Array.from({ length: props.count }).map((_, index) => {
    return (
      <div
        key={index}
        className="absolute bottom-0 top-0 w-[240px]"
        style={{
          left: `${(index + 1) * 240}px`,
          backgroundColor: index % 2 === 0 ? "#fff6e0" : "transparent",
          zIndex: -1,
        }}
      />
    );
  });
};

const GridLines = ({ dayWidth }: { dayWidth: number }) => {
  return (
    <>
      <div
        className="absolute bottom-0 top-0 h-full translate-x-1/2 bg-black"
        style={{
          left: `${dayWidth}px`,
          width: 2,
          zIndex: -1,
        }}
      />
      <div
        className="absolute bottom-0 top-0 h-full translate-x-1/2 bg-black"
        style={{
          right: `${dayWidth}px`,
          width: 2,
        }}
      />
    </>
  );
};

const GanttView = (props: Props) => {
  const { width, dayWidth, dayCount } = props.state;

  return (
    <div
      style={{
        width: `${width}px`,
      }}
      className="relative h-full"
    >
      {tripPlans.map((plan) => (
        <div
          className="grid h-16 w-full border-b-1.5 border-b-[#C59D89]"
          key={plan.id}
          style={{
            gridTemplateColumns: `${dayWidth}px 1fr ${dayWidth}px`,
          }}
        >
          <div className="sticky left-0 h-full  bg-[#EAEADD]">
            <div className="flex h-full items-center gap-2 px-10">
              {<plan.Icon size={20} />}
              {plan.title}
            </div>
          </div>
          <div></div>
          <div></div>
        </div>
      ))}
      <GridTileArea count={dayCount} />
      <GridLines dayWidth={dayWidth} />
    </div>
  );
};

export default GanttView;
