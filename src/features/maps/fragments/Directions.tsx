import { useState, useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";

import { Location, travelModeMap, useLocations } from "../hooks/useLocations";

function Directions() {
  const updateLocation = useLocations((state) => state.updateLocation);
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

    const routes = [];

    for (let i = 0; i < locations.length; i++) {
      const location = locations[i];

      if (i === locations.length - 1 || !location.travelMode) {
        break;
      }

      const travel = travelModeMap[location.travelMode!];

      routes.push({
        origin: [location.lat, location.lng],
        destination: [locations[i + 1].lat, locations[i + 1].lng],
        color: travel.color,
        travelMode: location.travelMode,
        oname: location.name,
        dname: locations[i + 1].name,
        id: location.id,
      });
    }

    for (let route of routes) {
      const { origin, destination, color, travelMode } = route;

      if (travelMode === "FLIGHT") {
        const path = new google.maps.MVCArray();
        const poly = new google.maps.Polyline({
          map: map,
          strokeColor: color,
        });

        path.push(new google.maps.LatLng(origin[0], origin[1]));
        path.push(new google.maps.LatLng(destination[0], destination[1]));

        poly.setPath(path);

        polylines.current = [...polylines.current, poly];
      } else {
        directionsService!
          .route({
            origin: new google.maps.LatLng(origin[0], origin[1]),
            destination: new google.maps.LatLng(destination[0], destination[1]),
            travelMode: travelMode as google.maps.TravelMode,
            provideRouteAlternatives: true,
          })
          .then((response) => {
            const path = new google.maps.MVCArray();
            const poly = new google.maps.Polyline({
              map: map,
              strokeColor: color,
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
            toast.error(
              `${travelMode.toLowerCase()} route not available between ${route.oname} an ${route.dname}`,
              {
                dismissible: true,
              }
            );
            updateLocation({
              id: route.id,
              travelMode: null,
            });
          });
      }
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
