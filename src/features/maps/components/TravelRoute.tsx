import { useState } from "react";

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

import { Location, RouteType, routes } from "../hooks/useLocations";
import { ChevronRight } from "lucide-react";

const TravelRoute = (props: {
  location: Location;
  onClick: (location: Partial<Location>) => void;
  isLast?: boolean;
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild={true}>
        <Button
          variant="outline"
          disabled={props.isLast}
          className="bg-orange-100 border-orange-600 hover:bg-orange-200"
        >
          <span>Edit</span>
          <ChevronRight size={18} />
        </Button>
      </DialogTrigger>

      <TravelRouteContent
        key={props.location.travelMode}
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

const TravelRouteContent = (props: {
  onSave: (route: RouteType) => void;
  mode?: RouteType | null;
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
