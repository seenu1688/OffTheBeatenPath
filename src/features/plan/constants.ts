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
    color: "#D9D4FE",
  },
  {
    id: "destinations",
    title: "Destinations",
    Icon: MapPin,
    color: "#FFD4EF",
  },
  {
    id: "routes",
    title: "Routes",
    Icon: Route,
    color: "#D3F8F0",
  },
  {
    id: "reservations",
    title: "Reservations",
    Icon: ListOrdered,
    color: "#D3F8F0",
  },
  {
    id: "activities",
    title: "Activities",
    Icon: Activity,
    color: "#D3F8F0",
  },
  {
    id: "guides",
    title: "Guides",
    Icon: PersonStanding,
    color: "#D3F8F0",
  },
  {
    id: "meals",
    title: "Meals",
    Icon: CookingPot,
    color: "#D3F8F0",
  },
  {
    id: "transportation",
    title: "Transportation",
    Icon: CarFront,
    color: "#D3F8F0",
  },
  {
    id: "other",
    title: "Other",
    Icon: CircleDot,
    color: "#D3F8F0",
  },
] as const;

export type TripPlanId = (typeof tripPlans)[number]["id"];

export type PlanType = (typeof tripPlans)[number];
