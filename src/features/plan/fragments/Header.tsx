import dayjs from "dayjs";
import { X } from "lucide-react";

import { DialogClose } from "@/components/dialog";

import { Departure, ReservationResponse } from "@/common/types";
import { Checkbox } from "@/components/ui/checkbox";

const Header = (props: {
  reservation: ReservationResponse;
  departure: Departure;
}) => {
  const { departure, reservation } = props;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center gap-3 ">
        <div className="flex justify-between gap-10 rounded-lg border bg-white p-3">
          <div>
            <div className="text-ellipsis font-medium">
              {reservation.experience?.name}
            </div>
            <div className="text-sm">{departure.tripName}</div>
          </div>
          <div className="w-1/2">
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <div className="font-medium">Check-In :</div>
              <div className="text-sm">
                {dayjs(reservation.startDateTime).format(
                  "MMM DD YYYY - hh:mm A"
                )}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] items-center gap-2">
              <div className="font-medium">Check-Out :</div>
              <div className="text-sm">
                {dayjs(reservation.endDateTime).format("MMM DD YYYY - hh:mm A")}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-10 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold">Critical:</span>
            <Checkbox
              checked={reservation.critical}
              className="border-gray-700"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold">PTC:</span>
            <Checkbox
              checked={reservation.preDepartureConfirmation}
              className="border-gray-700"
            />
          </div>
          <div className="flex items-center rounded-md border border-gray-600 px-3">
            <div className="border-r border-r-gray-600 px-2 py-1 font-bold">
              Status
            </div>
            <button className="px-2 py-1 font-medium text-destructive">
              {reservation.status}
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <DialogClose className="rounded-sm border border-destructive p-2">
          <X className="h-4 w-4 text-destructive" size={30} />
        </DialogClose>
      </div>
    </div>
  );
};

export default Header;
