import { PlannerState } from "../hooks/usePlanner";

const GridLines = (props: { state: PlannerState }) => {
  const { dayWidth, dayCount, startOffset } = props.state;

  return (
    <>
      <div
        className="absolute bottom-0 top-0 z-[100] h-full translate-x-1/2 bg-black"
        style={{
          left: `${dayWidth + startOffset * 10}px`,
          width: 2,
          zIndex: -1,
        }}
      />
      <div
        className="absolute bottom-0 top-0 h-full translate-x-1/2 bg-black"
        style={{
          left: `${dayCount * dayWidth + dayWidth}px`,
          width: 2,
        }}
      />
    </>
  );
};

export default GridLines;
