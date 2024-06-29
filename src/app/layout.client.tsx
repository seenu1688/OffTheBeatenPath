"use client";

import { PropsWithChildren, useState } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Toaster } from "sonner";
import { TrpcClientProvider } from "@/client";
import { QueryClient } from "@tanstack/react-query";

const HomeLayout = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(() => {
    return new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
    });
  });

  return (
    <TrpcClientProvider queryClient={queryClient}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
        {children}
        <Toaster />
      </APIProvider>
    </TrpcClientProvider>
  );
};

export default HomeLayout;
