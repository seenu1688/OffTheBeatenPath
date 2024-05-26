import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import type { Marker } from "@googlemaps/markerclusterer";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useParams } from "next/navigation";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

import { CreateSegmentButton } from "./CreateSegment";

import { useFilteredDestinations } from "../hooks/useDestinations";
import { useLocations } from "../hooks/useLocations";

import { Destination } from "@/common/types";
import { TrpcClientProvider } from "@/client";

const InfoWindowContent = ({
  destination,
  queryClient,
  departureId,
}: {
  destination: Destination;
  queryClient: QueryClient;
  departureId: string;
}) => {
  return (
    <TrpcClientProvider queryClient={queryClient}>
      <div className="flex flex-col gap-2 p-2">
        <div>{destination.name}</div>
        {destination.vendorType === "destinations" && (
          <CreateSegmentButton
            destination={destination}
            departureId={departureId}
          />
        )}
      </div>
    </TrpcClientProvider>
  );
};

const DestinationMarkers = () => {
  const map = useMap();
  const markers = useMapsLibrary("marker");
  const mapsLibrary = useMapsLibrary("maps");
  const clusterer = useRef<MarkerClusterer | null>(null);
  const destinations = useFilteredDestinations();
  const markersRef = useRef<{ [key: string]: Marker }>({});
  const addLocation = useLocations((state) => state.addLocation);
  const queryClient = useQueryClient();
  const params = useParams<{ id: string }>();

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
        const root = createRoot(container);
        // createPortal(<InfoWindowContent destination={destination} />, container);

        root.render(
          <InfoWindowContent
            destination={destination}
            queryClient={queryClient}
            departureId={params.id}
          />
        );

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
