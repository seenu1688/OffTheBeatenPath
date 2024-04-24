import { ChevronRight, Edit2, Plane, X } from "lucide-react";

import { Location } from "../hooks/useLocations";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";

const TravelModeLabel = () => {
  return (
    <div className="p-2 bg-stone-200 flex items-center gap-2 rounded-md select-none">
      <Plane size={16} />
      <div>Flight</div>
    </div>
  );
};

const Schedule = (props: { location: Location; onClick: () => void }) => {
  return (
    <Dialog>
      <DialogTrigger>
        <div
          className={cn(
            "flex gap-2 items-center justify-between",
            "border border-orange-500 p-3 rounded-lg bg-white cursor-pointer"
          )}
          onClick={props.onClick}
        >
          <div className="flex gap-2 ">
            <TravelModeLabel />
            <div className="flex flex-col gap-1 text-xs">
              <div>Flight from XYZ Airport</div>
              <div>12h 14mins</div>
            </div>
          </div>
          <div>
            <ChevronRight />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent>
        <h1>Flight</h1>
      </DialogContent>
    </Dialog>
  );
};

type Props = {
  location: Location;
  order: number;
  onAction: (payload: {
    type: "EDIT" | "DELETE" | "SCHEDULE";
    location: Location;
  }) => void;
};

const LocationCard = (props: Props) => {
  const hasDestination = !!props.location.travelMode;

  const handleAction = (type: "EDIT" | "DELETE" | "SCHEDULE") => {
    props.onAction({ type, location: props.location });
  };

  return (
    <div className={cn("relative", hasDestination && "line pb-8")}>
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
                onClick={handleAction.bind(null, "EDIT")}
              >
                <Edit2 size={13} />
              </button>
            </div>
            <button
              className="invisible group-hover:visible"
              onClick={handleAction.bind(null, "DELETE")}
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {hasDestination ? (
          <Schedule
            location={props.location}
            onClick={handleAction.bind(null, "SCHEDULE")}
          />
        ) : null}
      </div>
    </div>
  );
};

export default LocationCard;
