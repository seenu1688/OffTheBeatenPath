const GridLines = ({ dayWidth }: { dayWidth: number }) => {
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
          right: `${dayWidth + 45}px`,
          width: 2,
        }}
      />
    </>
  );
};

export default GridLines;
