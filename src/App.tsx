import { RouterProvider, createRouter } from "@tanstack/react-router";
import { APIProvider } from "@vis.gl/react-google-maps";

import { Toaster } from "@/components/sonner";

import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  return (
    <APIProvider apiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <RouterProvider router={router} />
      <Toaster />
    </APIProvider>
  );
}

export default App;
