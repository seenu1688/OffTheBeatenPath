import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/")({
  component: () => <div>Hello from Off The Beaten Path!</div>,
});
