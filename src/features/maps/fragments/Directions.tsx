import { useEffect } from "react";

import { Location, travelModeMap, useLocations } from "../hooks/useLocations";
import { RouteConfig, useDirections, } from "../hooks/useDirections";

function Directions() {
  const { drawRoute, directionsRenderer, directionsService, polylines } =
    useDirections();

  // FIXME: cache polylines by location so as to not recreate them
  const createRoutes = async (locations: Location[]) => {
    // clear previous polylines
    while (polylines.current.size > 0) {
      const [key, polyline] = polylines.current.entries().next().value;
      polyline.setMap(null);
      polylines.current.delete(key);
    }

    if (locations.length < 2) {
      return;
    }

    const routesConfig = [];

    for (let i = 0; i < locations.length; i++) {
      const origin = locations[i];

      if (i === locations.length - 1 || !origin.travelMode) {
        break;
      }

      const travel = travelModeMap[origin.travelMode!];
      const destination = locations[i + 1];

      routesConfig.push({
        origin: {
          latLng: new google.maps.LatLng(origin.lat, origin.lng),
          name: origin.name,
          id: origin.id,
        },
        destination: {
          latLng: new google.maps.LatLng(destination.lat, destination.lng),
          name: destination.name,
          id: destination.id,
        },
        strokeColor: travel.color,
        travelMode: origin.travelMode,
      } satisfies RouteConfig);
    }

    for (let config of routesConfig) {
      drawRoute(config);
    }
  };

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    createRoutes(useLocations.getState().locations);

    useLocations.subscribe((state) => {
      createRoutes(state.locations);
    });

    return () => directionsRenderer.setMap(null);
  }, [directionsService, directionsRenderer]);

  return null;
}

export default Directions;
