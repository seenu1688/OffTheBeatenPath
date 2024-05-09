import {
  Activity,
  CarFront,
  ListOrdered,
  Map,
  PersonStanding,
  Route,
  MapPin,
  CookingPot,
  CircleDot,
} from "lucide-react";

export const tripPlans = [
  {
    id: "segments",
    title: "Segments",
    Icon: Map,
  },
  {
    id: "destinations",
    title: "Destinations",
    Icon: MapPin,
  },
  {
    id: "routes",
    title: "Routes",
    Icon: Route,
  },
  {
    id: "reservations",
    title: "Reservations",
    Icon: ListOrdered,
  },
  {
    id: "activities",
    title: "Activities",
    Icon: Activity,
  },
  {
    id: "guides",
    title: "Guides",
    Icon: PersonStanding,
  },
  {
    id: "meals",
    title: "Meals",
    Icon: CookingPot,
  },
  {
    id: "transportation",
    title: "Transportation",
    Icon: CarFront,
  },
  {
    id: "other",
    title: "Other",
    Icon: CircleDot,
  },
] as const;
