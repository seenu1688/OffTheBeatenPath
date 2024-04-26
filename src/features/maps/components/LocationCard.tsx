import { Edit2, X } from "lucide-react";

import TravelRoute from "./TravelRoute";

import { Location } from "../hooks/useLocations";

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

  return (
    <div className={cn("relative", !props.isLast && "line pb-8")}>
      <div className="relative">
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
        </div>
        {!props.isLast && (
          <TravelRoute
            location={props.location}
            onClick={handleAction.bind(null, "SCHEDULE")}
          />
        )}
      </div>
    </div>
  );
};

export default LocationCard;
