import { useEffect, useRef, useState } from "react";
import { AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { useFilteredDestinations } from "../hooks/useDestinations";

const DestinationMarkers = () => {
  const destinations = useFilteredDestinations();
  const map = useMap();
  const [markers, setMarkers] = useState<{ [key: string]: Marker }>({});
  const clusterer = useRef<MarkerClusterer | null>(null);

  console.log(destinations);

  // Initialize MarkerClusterer
  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      //   const svg = window.btoa(`
      //     <svg fill="#edba31" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
      //     <circle cx="120" cy="120" opacity="1" r="70" />
      //     <circle cx="120" cy="120" opacity=".7" r="90" />
      //     <circle cx="120" cy="120" opacity=".3" r="110" />
      //     <circle cx="120" cy="120" opacity=".2" r="130" />
      //     </svg>`);

      //   const renderer = {
      //     render: ({ count, position }) =>
      //       new google.maps.Marker({
      //         label: {
      //           text: String(count),
      //           color: "#263184",
      //           fontSize: "14px",
      //           fontWeight: "600",
      //         },
      //         icon: {
      //           url: `data:image/svg+xml;base64,${svg}`,
      //           scaledSize: new google.maps.Size(45, 45),
      //         },
      //         position,
      //         // adjust zIndex to be above other markers
      //         zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
      //       }),
      //   };

      clusterer.current = new MarkerClusterer({
        map,
      });
    }
  }, [map]);

  // Update markers
  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker: Marker | null, key: string) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return destinations.map((destination) => {
    const { lat, lng } = destination.geolocation || {};

    if (!lat || !lng) {
      return null;
    }

    return (
      <AdvancedMarker
        key={destination.id}
        ref={(marker) => setMarkerRef(marker, destination.id)}
        position={destination.geolocation}
      />
    );
  });
};

export default DestinationMarkers;
