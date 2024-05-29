import { PropsWithChildren, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import type { Marker } from "@googlemaps/markerclusterer";

import { Button } from "@/components/button";

import { useFilteredDestinations } from "../hooks/useDestinations";
import { useLocations } from "../hooks/useLocations";

import { Destination } from "@/common/types";
import { trpcClient } from "@/client";

const CreateButton = (props: PropsWithChildren & { onClick: () => void }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      className="text-[#f97415]"
      onClick={props.onClick}
    >
      {props.children}
    </Button>
  );
};

const InfoWindowContent = ({
  destination,
  callback,
}: {
  destination: Destination;
  callback: () => void;
}) => {
  const handleClick = (entity: "reservation" | "segment" | "route") => {
    if (entity === "route") {
      callback();
      return;
    }

    const url = new URL(window.location.href);

    Array.from(url.searchParams.entries()).forEach(([key, value]) => {
      url.searchParams.delete(key);
    });

    url.searchParams.set("entity", entity);
    url.searchParams.set("id", destination.id);
    window.history.pushState(null, "", url.toString());
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-sm font-medium">{destination.name}</div>
      <div className="flex flex-col gap-2">
        <CreateButton onClick={handleClick.bind(null, "route")}>
          + Add To Route
        </CreateButton>
        {destination.vendorType === "destinations" && (
          <CreateButton onClick={handleClick.bind(null, "segment")}>
            + Add To Segment
          </CreateButton>
        )}
        {destination.vendorType !== "destinations" && (
          <CreateButton onClick={handleClick.bind(null, "reservation")}>
            + Add To Reservation
          </CreateButton>
        )}
      </div>
    </div>
  );
};

const DestinationMarkers = () => {
  const map = useMap();
  const markers = useMapsLibrary("marker");
  const mapsLibrary = useMapsLibrary("maps");
  const clusterer = useRef<MarkerClusterer | null>(null);
  const destinations = useFilteredDestinations();
  const markersRef = useRef<{ [key: string]: Marker }>({});
  const addLocation = useLocations(useShallow((state) => state.addLocation));

  useEffect(() => {
    if (!map || !markers || !mapsLibrary) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({
        map,
      });
    }

    const infoWindow = new mapsLibrary.InfoWindow();

    infoWindow.addListener("closeclick", () => {
      const url = new URL(window.location.href);

      Array.from(url.searchParams.entries()).forEach(([key, value]) => {
        url.searchParams.delete(key);
      });
      window.history.pushState(null, "", url.toString());
    });

    const handleMarkerClick = (destination: Destination, marker: Marker) => {
      infoWindow.close();

      const container = document.createElement("div");
      const root = createRoot(container);

      root.render(
        <InfoWindowContent
          destination={destination}
          callback={() => {
            if (!destination.geolocation.lat || !destination.geolocation.lng) {
              toast.error("Destination does not have a valid geolocation");
              return;
            }
            addLocation({
              id: destination.id,
              name: destination.name,
              lat: destination.geolocation!.lat,
              lng: destination.geolocation!.lng,
              placeId: "",
            });
          }}
        />
      );

      infoWindow.setContent(container);
      infoWindow.open(map, marker);
    };

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

      marker.addListener(
        "click",
        handleMarkerClick.bind(null, destination, marker)
      );

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
