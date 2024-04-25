import { useState, useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import { Location, useLocations } from "../hooks/useLocations";

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const polylines = useRef<google.maps.Polyline[]>([]);

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  // FIXME: cache polylines by location so as to not recreate them
  const createRoutes = async (locations: Location[]) => {
    // clear previous polylines
    while (polylines.current.length > 0) {
      const polyline = polylines.current.pop();
      polyline?.setMap(null);
    }

    if (locations.length < 2) {
      return;
    }

    const points = [];

    for (let i = 0; i < locations.length; i++) {
      if (i === locations.length - 1 || !locations[i].travelMode) {
        break;
      }

      points.push({
        origin: [locations[i].lat, locations[i].lng],
        destination: [locations[i + 1].lat, locations[i + 1].lng],
      });
    }

    points.forEach(({ origin, destination }) => {
      directionsService!
        .route({
          origin: new google.maps.LatLng(origin[0], origin[1]),
          destination: new google.maps.LatLng(destination[0], destination[1]),
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        })
        .then((response) => {
          const path = new google.maps.MVCArray();
          const poly = new google.maps.Polyline({
            map: map,
            strokeColor: "purple",
          });
          const currentRoute = response.routes[0];
          const len = currentRoute.overview_path.length;
          for (var i = 0; i < len; i++) {
            const currentPath = currentRoute.overview_path[i];

            path.push(currentPath);
          }

          poly.setPath(path);

          polylines.current = [...polylines.current, poly];
        })
        .catch((e) => {
          console.log(e);
        });
    });
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
