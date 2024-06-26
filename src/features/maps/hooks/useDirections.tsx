import { useEffect, useRef, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { toast } from "sonner";

import { RouteType, useLocations } from "./useLocations";
import { useDistance } from "./useDistance";

export const PATH_LINE_SEPARATOR = "_2_";

export type RouteConfig = {
  origin: {
    id: string;
    latLng: google.maps.LatLng;
    name: string;
  };
  destination: {
    id: string;
    latLng: google.maps.LatLng;
    name: string;
  };
  strokeColor: string;
  travelMode: RouteType;
};

export const useDirections = () => {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();
  const updateLocation = useLocations((state) => state.updateLocation);
  const polylines = useRef<Map<string, google.maps.Polyline>>(new Map());
  const { addMeta, removeMeta } = useDistance();

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  const drawRoute = (config: RouteConfig) => {
    const { destination, origin, strokeColor, travelMode } = config;

    if (travelMode === "FLIGHT") {
      const path = new google.maps.MVCArray();
      const poly = new google.maps.Polyline({
        map: map,
        strokeColor,
      });

      path.push(origin.latLng);
      path.push(destination.latLng);

      poly.setPath(path);

      polylines.current.set(
        `${origin.id}${PATH_LINE_SEPARATOR}${destination.id}`,
        poly
      );
      removeMeta(origin.id);
    } else {
      directionsService!
        .route({
          origin: origin.latLng,
          destination: destination.latLng,
          travelMode: travelMode as google.maps.TravelMode,
          provideRouteAlternatives: true,
        })
        .then((response) => {
          const path = new google.maps.MVCArray();
          const poly = new google.maps.Polyline({
            map: map,
            strokeColor,
          });
          const currentRoute = response.routes[0];
          const len = currentRoute.overview_path.length;
          for (var i = 0; i < len; i++) {
            const currentPath = currentRoute.overview_path[i];

            path.push(currentPath);
          }

          poly.setPath(path);

          polylines.current.set(
            `${origin.id}${PATH_LINE_SEPARATOR}${destination.id}`,
            poly
          );

          const leg = currentRoute.legs[0];

          if (!!leg) {
            addMeta(origin.id, {
              distance: leg.distance,
              duration: leg.duration,
            });
          }
        })
        .catch((e) => {
          console.log(e);
          toast.error(
            `${travelMode.toLowerCase()} route not available between ${origin.name} an ${destination.name}`,
            {
              dismissible: true,
              position: "top-center",
              style: {
                backgroundColor: "red",
                color: "white",
              },
            }
          );
          updateLocation({
            id: origin.id,
            travelMode: null,
          });
        });
    }
  };

  return { drawRoute, directionsRenderer, directionsService, map, polylines };
};
