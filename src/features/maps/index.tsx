"use client";

import dynamic from "next/dynamic";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Loader } from "lucide-react";
import ParamModal from "./ParamModal";

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
      <ParamModal />
    </div>
  );
};

export default MapPlanner;
