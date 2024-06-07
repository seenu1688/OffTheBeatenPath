import { PlannerState } from "../hooks/usePlanner";

const GridLines = (props: { state: PlannerState }) => {
  const { dayWidth, dayCount } = props.state;

  return (
    <>
      <div
        className="absolute bottom-0 top-0 h-full translate-x-1/2 bg-black"
        style={{
          left: `${dayWidth + 45}px`,
          width: 2,
          zIndex: -1,
        }}
      />
      <div
        className="absolute bottom-0 top-0 h-full translate-x-1/2 bg-black"
        style={{
          left: `${dayCount * dayWidth + dayWidth + 45}px`,
          width: 2,
        }}
      />
    </>
  );
};

export default GridLines;
