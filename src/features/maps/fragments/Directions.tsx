import { useEffect } from "react";

import { Location, travelModeMap, useLocations } from "../hooks/useLocations";
import {
  PATH_LINE_SEPARATOR,
  RouteConfig,
  useDirections,
} from "../hooks/useDirections";
import { usePathHighlights } from "../hooks/usePathHighlights";

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

      if (i !== locations.length - 1 && !!origin.travelMode) {
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
    }

    for (let config of routesConfig) {
      drawRoute(config);
    }
  };

  // Use directions service
  useEffect(() => {
    if (!directionsService || !directionsRenderer) return;

    createRoutes(useLocations.getState().locations);

    const routesUnsubscribe = useLocations.subscribe((state) => {
      console.log({ locations: state.locations });

      createRoutes(state.locations);
    });

    const unsubscribe = usePathHighlights.subscribe((state) => {
      const locations = useLocations.getState().locations;

      for (let [key, polyline] of polylines.current) {
        const [originId] = key.split(PATH_LINE_SEPARATOR);
        const location = locations.find((loc) => loc.id === originId);

        if (!location || !location?.travelMode) {
          return;
        }

        if (!state.highlightId) {
          const travel = travelModeMap[location.travelMode];

          polyline.setOptions({
            strokeColor: travel.color,
            zIndex: 1,
            strokeWeight: 3,
          });
        } else {
          const travel = travelModeMap[location.travelMode];

          const isHighlighted = state.highlightId === originId;

          polyline.setOptions({
            strokeColor: isHighlighted ? travel.color : "gray",
            zIndex: isHighlighted ? 1 : 0,
            strokeWeight: isHighlighted ? 5 : 3,
          });
        }
      }
    });

    return () => {
      directionsRenderer.setMap(null);
      unsubscribe();
      routesUnsubscribe();
    };
  }, [directionsService, directionsRenderer]);

  return null;
}

export default Directions;
