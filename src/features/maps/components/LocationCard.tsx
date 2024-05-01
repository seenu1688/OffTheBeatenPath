import { Edit2, X } from "lucide-react";

import { Label } from "@/components/label";
import TravelRoute from "./TravelRoute";

import { Location, routes } from "../hooks/useLocations";

import { cn } from "@/lib/utils";

type Props = {
  location: Location;
  order: number;
  onAction: (payload: {
    type: "EDIT" | "DELETE" | "SCHEDULE";
    location: Location;
  }) => void;
  isLast?: boolean;
};

const LocationCard = (props: Props) => {
  const handleAction = (
    type: "EDIT" | "DELETE" | "SCHEDULE",
    location: Partial<Location> = {}
  ) => {
    props.onAction({
      type,
      location: {
        ...props.location,
        ...location,
      },
    });
  };

  const route = routes.find((route) => route.id === props.location.travelMode);

  return (
    <div className={
      cn(
        "w-full relative pb-7",
        !props.isLast && "line" 
      )
    }>
      <div
        className={cn("relative border bg-white rounded-lg border-orange-500")}
      >
        <div className="py-3 px-2 rounded-lg">
          <div className="flex items-center justify-between gap-4 mb-3 group">
            <div className="flex items-center gap-3 text-sm font-medium">
              <div className="bg-orange-600 p-1 flex items-center justify-center text-white min-w-8 rounded-md">
                {props.order}
              </div>
              <div>{props.location.name}</div>
              <button
                className="invisible group-hover:visible"
                onClick={handleAction.bind(null, "EDIT", {})}
              >
                <Edit2 size={13} />
              </button>
            </div>
            <button
              className="invisible group-hover:visible"
              onClick={handleAction.bind(null, "DELETE", {})}
            >
              <X size={18} />
            </button>
          </div>
        {!!props.location.travelMode &&  <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 py-2 px-2 rounded-md w-min border bg-stone-200">
              <div className="flex items-center gap-2 rounded-md select-none h-auto">
                {route ? <route.icon size={22} /> : null}
              </div>
              <Label className="flex flex-col text-xs items-center text-left font-normal">
                {route?.name}
              </Label>
            </div>
            {props.location.duration ? (
              <div className="text-orange-500 text-xs">
                {props.location.duration}
              </div>
            ) : null}
          </div>}
          <div className="flex justify-end">
            <TravelRoute
            location={props.location}
            onClick={handleAction.bind(null, "SCHEDULE")}
            isLast={props.isLast}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationCard;
