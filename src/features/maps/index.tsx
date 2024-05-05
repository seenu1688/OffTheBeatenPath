"use client";

import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Loader } from "lucide-react";

import MapPreview from "./MapPreview";
import Sidebar from "./Sidebar";

const MapPlanner = () => {
  const isApiLoaded = useApiIsLoaded();

  if (!isApiLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full">
      <Sidebar />
      <MapPreview />
    </div>
  );
};

export default MapPlanner;
