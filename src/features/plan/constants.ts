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
  Hotel,
} from "lucide-react";

export const tripPlans = [
  {
    id: "segments",
    title: "Segments",
    Icon: Map,
    accentColor: "#D9D4FE",
    primaryColor: "#8377D4",
  },
  {
    id: "destinations",
    title: "Destinations",
    Icon: MapPin,
    accentColor: "#FFD4EF",
    primaryColor: "#CF669E",
  },
  {
    id: "routes",
    title: "Routes",
    Icon: Route,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "lodging",
    title: "Lodging",
    Icon: Hotel,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "activities",
    title: "Activities",
    Icon: Activity,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "guides",
    title: "Guides",
    Icon: PersonStanding,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "meals",
    title: "Meals",
    Icon: CookingPot,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "transportation",
    title: "Transportation",
    Icon: CarFront,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
  {
    id: "other",
    title: "Other",
    Icon: CircleDot,
    accentColor: "#D3F8F0",
    primaryColor: "#0B8B70",
  },
] as const;

export type TripPlanId = (typeof tripPlans)[number]["id"];

export type PlanType = (typeof tripPlans)[number];
