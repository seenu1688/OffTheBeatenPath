import { Plane, ChevronRight } from "lucide-react";
import { Location } from "../hooks/useLocations";

const TravelModeLabel = () => {
  return (
    <div className="p-2 bg-stone-200 flex items-center gap-2 rounded-md select-none">
      <Plane size={20} />
      <div>Flight</div>
    </div>
  );
};

type Props = {
  location: Location;
  order: number;
};

const LocationCard = (props: Props) => {
  return (
    <div className="border border-orange-500 p-3 rounded-lg bg-white">
      <div className="flex items-start gap-3 mb-3 text-sm font-medium">
        <div className="bg-orange-600 p-1 flex items-center justify-center text-white min-w-8 rounded-md">
          {props.order}
        </div>
        <div>{props.location.name}</div>
      </div>
      <div className="flex gap-2">
        <TravelModeLabel />
        <div className="flex flex-col gap-1 text-xs">
          <div>Flight from XYZ Airport</div>
          <div>12h 14mins</div>
        </div>
      </div>
      <div className="flex justify-end">
        <button className="border border-orange-500 bg-orange-100 flex items-center gap-1 px-3 py-2 rounded-md select-none">
          <span>Edit</span>
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default LocationCard;
