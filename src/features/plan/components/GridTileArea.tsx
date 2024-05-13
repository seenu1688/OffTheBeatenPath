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

export default GridTileArea;
