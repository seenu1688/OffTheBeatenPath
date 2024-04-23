import { createLazyFileRoute } from "@tanstack/react-router";

import MapPlanner from "@/features/maps";

export const Route = createLazyFileRoute("/")({
  component: () => <MapPlanner />,
});
