"use client";

import { PropsWithChildren } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "sonner";
import { TrpcClientProvider } from "@/client";

const HomeLayout = ({ children }: PropsWithChildren) => {
  return (
    <TrpcClientProvider>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        {children}
        <Toaster />
      </APIProvider>
    </TrpcClientProvider>
  );
};

export default HomeLayout;
