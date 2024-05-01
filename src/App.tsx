import { Suspense } from "react";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { Loader } from "lucide-react";

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
    <Suspense fallback={<Loader className="animate-spin" />}>
      <RouterProvider router={router} />
      <Toaster />
    </Suspense>
  );
}

export default App;
