import { Suspense } from "react";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useApiIsLoaded } from "@vis.gl/react-google-maps";
import { Loader } from "lucide-react";

export const Route = createRootRoute({
  component: () => {
    const isApiLoaded = useApiIsLoaded();

    if (!isApiLoaded) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <Loader className="animate-spin" />
        </div>
      );
    }

    return (
      <Suspense>
        <Outlet />
      </Suspense>
    );
  },
});
