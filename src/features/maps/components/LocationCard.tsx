import { Edit2, X } from "lucide-react";
import { Reorder } from "framer-motion";

import { Label } from "@/components/label";
import TravelRoute from "./TravelRoute";

import { Location, routes } from "../hooks/useLocations";
import { useDistance } from "../hooks/useDistance";
import { usePathHighlights } from "../hooks/usePathHighlights";

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
  const { distances } = useDistance();

  const info = distances.get(props.location.id) ?? {};

  return (
    <Reorder.Item key={props.location.id} value={location}>
      <div
        className={cn("w-full relative pb-7", !props.isLast && "line")}
        onMouseOver={() => {
          if (props.isLast || !props.location.travelMode) return;

          const state = usePathHighlights.getState();

          if (state.highlightId === props.location.id) return;

          state.setHighlightId(props.location.id);
        }}
        onMouseLeave={() => {
          if (props.isLast || !props.location.travelMode) return;

          const state = usePathHighlights.getState();
          state.setHighlightId(null);
        }}
      >
        <div
          className={cn(
            "relative border bg-white rounded-lg border-orange-500"
          )}
        >
          <div className="py-3 px-2 rounded-lg">
            <div className="flex items-center justify-between gap-4 mb-3 group">
              <div className="flex items-center gap-3 text-sm font-medium">
                <div className="bg-orange-600 p-1 flex items-center justify-center text-white min-w-8 rounded-md">
                  {props.order}
                </div>
                <div>{props.location.name}</div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  title="Edit location"
                  aria-label="Edit location"
                  className="invisible group-hover:visible"
                  onClick={handleAction.bind(null, "EDIT", {})}
                >
                  <Edit2 size={13} />
                </button>
                <button
                  title="Delete location"
                  aria-label="Delete location"
                  className="invisible group-hover:visible"
                  onClick={handleAction.bind(null, "DELETE", {})}
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {!!props.location.travelMode && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 py-2 px-2 rounded-md w-min border bg-stone-200">
                  <div className="flex items-center gap-2 rounded-md select-none h-auto">
                    {route ? <route.icon size={22} /> : null}
                  </div>
                  <Label className="flex flex-col text-xs items-center text-left font-normal">
                    {route?.name}
                  </Label>
                </div>
                <div className="flex gap-3">
                  {!!info.distance ? (
                    <div className="text-orange-500 text-base">
                      {info.distance.text}
                    </div>
                  ) : null}
                  {!!info.duration ? (
                    <div className="text-orange-500 text-base">
                      {info.duration.text}
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            {!props.isLast && (
              <div className="flex justify-end">
                <TravelRoute
                  location={props.location}
                  onClick={handleAction.bind(null, "SCHEDULE")}
                  isLast={props.isLast}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Reorder.Item>
  );
};

export default LocationCard;
