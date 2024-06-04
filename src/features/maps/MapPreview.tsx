"use client";

import { useEffect } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/tooltip";

import Directions from "./fragments/Directions";
import DestinationMarkers from "./fragments/DestinationMarkers";

import { Location, useLocations } from "./hooks/useLocations";
import { trpcClient } from "@/client";
import { Departure } from "@/common/types";

const DEFAULT_CENTER = {
  lat: 45.6823097,
  lng: -111.0394193,
};

const MapPreview = (props: { departure: Departure }) => {
  const locations = useLocations((state) =>
    state.enabled ? state.locations : []
  );
  const map = useMap();

  const { mutate: saveRouteInfo } =
    trpcClient.departures.saveRouteInfo.useMutation();
  const { id: departureId } = props.departure;

  useEffect(() => {
    const unsubscribe = useLocations.subscribe((state) => {
      const { locations } = state;
      saveRouteInfo({
        departureId: departureId,
        routeInfo: JSON.stringify(locations),
      });
    });

    return unsubscribe;
  }, [departureId, saveRouteInfo]);

  useEffect(() => {
    if (!map) return;

    const unsubscribe = useLocations.subscribe((state) => {
      var latlngbounds = new google.maps.LatLngBounds();

      state.locations.forEach((location) => {
        const latLong = new google.maps.LatLng(location.lat, location.lng);
        latlngbounds.extend(latLong);
      });

      map.setCenter(latlngbounds.getCenter());
      map.fitBounds(latlngbounds);
    });

    return unsubscribe;
  }, [map]);

  const getBoundes = (locations: Location[]) => {
    if (locations.length === 0) {
      return map?.getBounds()?.toJSON();
    }

    var latlngbounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const latLong = new google.maps.LatLng(location.lat, location.lng);
      latlngbounds.extend(latLong);
    });

    return latlngbounds.toJSON();
  };

  return (
    <div className="flex-1">
      <Map
        defaultZoom={12}
        mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID}
        mapTypeId={"roadmap"}
        defaultBounds={getBoundes(locations)}
        mapTypeControlOptions={{
          position: google.maps.ControlPosition.TOP_RIGHT,
        }}
        mapTypeControl={false}
        defaultCenter={{
          lat: DEFAULT_CENTER.lat,
          lng: DEFAULT_CENTER.lng,
        }}
      >
        {locations.map((location, index) => {
          return (
            <AdvancedMarker
              position={{ lat: location.lat, lng: location.lng }}
              key={location.id}
              zIndex={100}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <div className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-2xl bg-white text-xl">
                      {index + 1}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <TooltipArrow />
                    <span>{location.name}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </AdvancedMarker>
          );
        })}
        <Directions />
        <DestinationMarkers />
      </Map>
    </div>
  );
};

export default MapPreview;
