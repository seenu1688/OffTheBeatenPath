import { Map, AdvancedMarker } from "@vis.gl/react-google-maps";

import { useLocations } from "./hooks/useLocations";

const MapPreview = () => {
  const locations = useLocations((state) => state.locations);

  return (
    <div className="flex-1">
      <Map
        defaultZoom={12}
        zoomControl={true}
        defaultCenter={{ lat: 43.6456, lng: -79.3754 }}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID}
      >
        {locations.map((location, index) => {
          return (
            <AdvancedMarker
              key={location.id}
              position={{ lat: location.lat, lng: location.lng }}
              title={"AdvancedMarker with customized pin." + index}
            >
              <div className="w-8 h-8 rounded-2xl bg-white flex items-center justify-center text-xl">
                {index + 1}
              </div>
            </AdvancedMarker>
          );
        })}
      </Map>
    </div>
  );
};

export default MapPreview;
