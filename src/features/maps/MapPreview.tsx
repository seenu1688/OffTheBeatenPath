"use client";

import { useEffect } from "react";
import { Map, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { Tooltip, TooltipArrow, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/tooltip";

import Directions from "./fragments/Directions";

import { Location, useLocations } from "./hooks/useLocations";

const MapPreview = () => {
  const locations = useLocations((state) => state.locations);
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // var latlngbounds = new google.maps.LatLngBounds();

    // locations.forEach((location) => {
    //   const latLong = new google.maps.LatLng(location.lat, location.lng);
    //   latlngbounds.extend(latLong);
    // });

    // console.log(latlngbounds.toJSON());
    // map.setCenter(latlngbounds.getCenter());
    // map.fitBounds(latlngbounds);

    // let line = new google.maps.Polyline({
    //   path: [
    //     new google.maps.LatLng(40.7126802, -74.00657629999999),
    //     new google.maps.LatLng(34.0549067, -118.2426508),
    //   ],
    //   strokeColor: "#5BC6A8",
    //   strokeOpacity: 1.0,
    //   strokeWeight: 4,
    //   map: map,
    // });
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
                    <div className="w-8 h-8 rounded-2xl bg-white pointer-events-auto flex items-center justify-center text-xl">
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
      </Map>
    </div>
  );
};

export default MapPreview;
