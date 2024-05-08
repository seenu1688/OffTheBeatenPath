"use client";

import { PropsWithChildren } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "sonner";

const HomeLayout = ({ children }: PropsWithChildren) => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      {children}
      <Toaster />
    </APIProvider>
  );
};

export default HomeLayout;
