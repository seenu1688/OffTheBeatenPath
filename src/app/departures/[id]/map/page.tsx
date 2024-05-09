import dynamic from "next/dynamic";

const MapPlanner = dynamic(() => import("@/features/maps"), {
  ssr: false,
});

const MapPage = () => {
  return <MapPlanner />;
};

export default MapPage;
