import { useState } from "react";
import { ChevronRight } from "lucide-react";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/radio-group";
import { Label } from "@/components/label";
import { Button } from "@/components/button";

import { Location, Route, RouteType, routes } from "../hooks/useLocations";

import { cn } from "@/lib/utils";

const TravelRoute = (props: {
  location: Location;
  onClick: (location: Partial<Location>) => void;
}) => {
  const hasDestination = !!props.location.travelMode;

  const route = routes.find((route) => route.id === props.location.travelMode);

  return (
    <Dialog>
      <DialogTrigger className="w-[calc(100%-40px)]">
        <div
          className={cn(
            "flex gap-2 items-center justify-between w-full",
            "border border-orange-500 p-3 rounded-lg bg-white cursor-pointer"
          )}
        >
          {hasDestination ? (
            <div className="flex items-center gap-2 w-full">
              <div className="px-2 bg-stone-200 flex items-center gap-2 rounded-md select-none h-auto">
                {route ? <route.icon size={22} /> : null}
              </div>
              <div className="flex flex-col gap-1 text-xs items-center text-left">
                <Label>{route?.name}</Label>
                <div>{props.location.duration}</div>
              </div>
            </div>
          ) : (
            <div className="flex w-full">Select a route</div>
          )}
          <div>
            <ChevronRight />
          </div>
        </div>
      </DialogTrigger>

      <TravelRoute.Content
        onSave={(mode: RouteType) => {
          props.onClick({
            travelMode: mode,
          });
        }}
        mode={props.location.travelMode}
      />
    </Dialog>
  );
};

TravelRoute.Content = (props: {
  onSave: (route: RouteType) => void;
  mode?: RouteType;
}) => {
  const [route, setRoute] = useState<undefined | string>(undefined);

  return (
    <DialogContent>
      <DialogHeader className="pb-5">
        <DialogTitle>Select a route</DialogTitle>
      </DialogHeader>
      <RadioGroup
        defaultValue={props.mode ?? ""}
        onValueChange={setRoute}
        value={route}
        className="gap-6"
      >
        {routes.map((route) => {
          return (
            <div key={route.id} className="flex items-center space-x-2">
              <RadioGroupItem value={route.id} id={route.id} />
              <Label htmlFor={route.id}>{route.name}</Label>
            </div>
          );
        })}
      </RadioGroup>
      <DialogFooter>
        <DialogClose asChild={true}>
          <Button
            disabled={!route}
            onClick={() => {
              props.onSave(route! as RouteType);
            }}
          >
            Save Route
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
};

export default TravelRoute;
