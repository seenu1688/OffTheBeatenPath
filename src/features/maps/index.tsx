"use client";

import { useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Loader } from "lucide-react";

import { useDestinations } from "./hooks/useDestinations";

import { trpcStandAloneClient } from "@/client";

const MapPreview = dynamic(() => import("./MapPreview"), {
  ssr: false,
});
const Sidebar = dynamic(() => import("./Sidebar"), {
  ssr: false,
});

const MapPlanner = () => {
  const isApiLoaded = useApiIsLoaded();

  if (!isApiLoaded) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full">
      <Sidebar />
      <MapPreview />
    </div>
  );
};

export default MapPlanner;
