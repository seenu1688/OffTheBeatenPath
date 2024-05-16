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

import { Location, useLocations } from "./hooks/useLocations";
import DestinationMarkers from "./fragments/DestinationMarkers";

const DEFAULT_CENTER = {
  lat: 45.6823097,
  lng: -111.0394193,
};

const MapPreview = () => {
  const locations = useLocations((state) => state.locations);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    useLocations.subscribe((state) => {
      var latlngbounds = new google.maps.LatLngBounds();

      state.locations.forEach((location) => {
        const latLong = new google.maps.LatLng(location.lat, location.lng);
        latlngbounds.extend(latLong);
      });

      map.setCenter(latlngbounds.getCenter());
      map.fitBounds(latlngbounds);
    });
  }, [map]);

  const getBoundes = (locations: Location[]) => {
    if (locations.length === 0) {
      return undefined;
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
