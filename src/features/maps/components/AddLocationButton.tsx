import { Button } from "@/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/dialog";
import { Input } from "@/components/input";

export enum LocationType {
  Origin,
  Destination,
}

const AddLocationButton = ({ type }: { type: LocationType }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-gray-300 hover:bg-gray-200">
          {type === LocationType.Origin ? "Add Origin" : "Add New Destination"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {type === LocationType.Origin
              ? "Add Origin"
              : "Add New Destination"}
          </DialogTitle>
        </DialogHeader>
        <Input placeholder="Search for a location" />
      </DialogContent>
    </Dialog>
  );
};

export default AddLocationButton;
