import { useEffect, useRef } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

import { useFilteredDestinations } from "../hooks/useDestinations";
import { useLocations } from "../hooks/useLocations";

import { Destination } from "@/common/types";

const DestinationMarkers = () => {
  const map = useMap();
  const markers = useMapsLibrary("marker");
  const mapsLibrary = useMapsLibrary("maps");
  const clusterer = useRef<MarkerClusterer | null>(null);
  const destinations = useFilteredDestinations();
  const markersRef = useRef<{ [key: string]: Marker }>({});
  const addLocation = useLocations((state) => state.addLocation);

  useEffect(() => {
    if (!map || !markers || !mapsLibrary) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
      });
    }

    const infoWindow = new mapsLibrary.InfoWindow();

    const elements = destinations.reduce((acc, destination) => {
      const { lat, lng } = destination.geolocation || {};

      if (!lat || !lng) {
        return acc;
      }

      if (markersRef.current[destination.id]) {
        return [...acc, markersRef.current[destination.id]];
      }

      const pin = new markers.PinElement({});

      const marker = new markers.AdvancedMarkerElement({
        map,
        position: destination.geolocation,
        title: destination.name,
        content: pin.element,
      });

      const createInfoContent = (
        destination: Destination,
        callback: () => void
      ) => {
        const container = document.createElement("div");
        container.style.padding = "8px";
        container.style.display = "flex";
        container.style.gap = "8px";

        const title = document.createElement("span");
        title.textContent = destination.name;
        container.appendChild(title);

        const button = document.createElement("button");
        button.textContent = "+ Add";
        button.style.color = "#f97415";
        button.style.fontWeight = "bold";

        button.addEventListener("click", () => {
          addLocation({
            id: destination.id,
            name: destination.name,
            lat: destination.geolocation!.lat,
            lng: destination.geolocation!.lng,
            placeId: "",
          });

          callback();
        });

        container.appendChild(button);

        return container;
      };

      marker.addListener("click", () => {
        infoWindow.close();
        infoWindow.setContent(
          createInfoContent(destination, () => {
            infoWindow.close();
          })
        );
        infoWindow.open(map, marker);
      });

      markersRef.current[destination.id] = marker;

      return [...acc, marker];
    }, [] as Marker[]);

    if (elements.length > 0) clusterer.current?.addMarkers(elements);

    return () => {
      clusterer.current?.clearMarkers();
    };
  }, [map, markers, mapsLibrary, destinations, addLocation]);

  return null;
};

export default DestinationMarkers;
