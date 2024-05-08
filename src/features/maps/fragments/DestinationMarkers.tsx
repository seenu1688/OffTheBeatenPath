import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { useFilteredDestinations } from "../hooks/useDestinations";

const DestinationMarkers = () => {
  const map = useMap();
  const markers = useMapsLibrary("marker");
  const clusterer = useRef<MarkerClusterer | null>(null);
  const destinations = useFilteredDestinations();
  const markersRef = useRef<{ [key: string]: Marker }>({});

  useEffect(() => {
    if (!map || !markers) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
      });
    }

    const elements = destinations
      .map((destination) => {
        const { lat, lng } = destination.geolocation || {};

        if (!lat || !lng) {
          return null;
        }

        if (markersRef.current[destination.id]) {
          return markersRef.current[destination.id];
        }

        return (markersRef.current[destination.id] =
          new markers.AdvancedMarkerElement({
            map,
            position: destination.geolocation,
            title: destination.name,
          }));
      })
      .filter(
        (element) => element !== null
      ) as google.maps.marker.AdvancedMarkerElement[];

    if (elements.length > 0) clusterer.current?.addMarkers(elements);

    return () => {
      clusterer.current?.clearMarkers();
    };
  }, [map, markers, destinations]);

  return null;
};

export default DestinationMarkers;
