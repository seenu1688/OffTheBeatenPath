import { useState, useEffect } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

import { Location, useLocations } from "../hooks/useLocations";

function Directions() {
  const map = useMap();
  const routesLibrary = useMapsLibrary("routes");
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer>();

  // Initialize directions service and renderer
  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    setDirectionsRenderer(new routesLibrary.DirectionsRenderer({ map }));
  }, [routesLibrary, map]);

  const createRoutes = (locations: Location[]) => {
    if (locations.length < 2) {
      directionsRenderer?.setMap(null);
      return;
    }

    // const waypoints = locations
    //   .slice(1, locations.length - 1)
    //   .map((location) => ({
    //     location: new google.maps.LatLng(location.lat, location.lng),
    //   }));
    // const origin = locations[0];
    // const destination = locations[locations.length - 1];

    const points = [] as [google.maps.LatLng, google.maps.LatLng][];

    for (let i = 0; i < locations.length; i++) {
      if (i === locations.length - 1) {
        break;
      }

      points.push([
        new google.maps.LatLng(locations[i].lat, locations[i].lng),
        new google.maps.LatLng(locations[i + 1].lat, locations[i + 1].lng),
      ]);
    }

    let index = 0;

    points.forEach(([origin, destination]) => {
      directionsService!
        .route({
          origin: new google.maps.LatLng(origin.lat(), origin.lng()),
          destination: new google.maps.LatLng(
            destination.lat(),
            destination.lng()
          ),
          travelMode: google.maps.TravelMode.DRIVING,
          provideRouteAlternatives: true,
        })
        .then((response) => {
          console.log(response);

          const path = new google.maps.MVCArray();
          //Set the Path Stroke Color
          const poly = new google.maps.Polyline({
            map: map,
            strokeColor: "purple",
          });
          index++;
          let totalDistance = 0;
          const currentRoute = response.routes[0];
          const len = currentRoute.overview_path.length;
          for (var i = 0; i < len; i++) {
            const currentPath = currentRoute.overview_path[i];

            path.push(currentPath);
          }

          poly.setPath(path);

          for (i = 0; i < currentRoute.legs.length; i++) {
            const leg = currentRoute.legs[i];
            if (leg.distance) {
              totalDistance += leg.distance.value;
            }
          }

          // const marker = new google.maps.marker.AdvancedMarkerElement({
          //   map: map,
          //   position: poly.GetPointAtDistance(distance),
          //   title: "${distance} kms",
          // });

          // marker.setPosition(poly.GetPointAtDistance(distance));

          // directionsRenderer!.setDirections(response);
          // directionsRenderer!.setOptions({
          //   polylineOptions: {
          //     strokeColor: "purple",
          //   },
          //   markerOptions: { visible: false },
          // });
          // setRoutes(response.routes);
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
