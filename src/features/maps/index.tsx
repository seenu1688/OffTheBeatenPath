import MapPreview from "./MapPreview";
import Sidebar from "./Sidebar";

const MapPlanner = () => {
  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <MapPreview />
    </div>
  );
};

export default MapPlanner;
