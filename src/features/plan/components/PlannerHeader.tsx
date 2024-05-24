"use client";

import dayjs from "dayjs";

import { Button } from "@/components/button";
import { CalendarPicker } from "@/components/calendar";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
} from "@/components/dialog";
import AddSegment from "../fragments/AddSegment";

import { Departure } from "@/common/types";

type Props = {
  departure: Departure;
};

const PlannerHeader = (props: Props) => {
  const startDate = dayjs(props.departure.startDate).format("DD/MM/YYYY");
  const endDate = dayjs(props.departure.endDate).format("DD/MM/YYYY");

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f7f7f7] px-6 py-3">
      <div className="flex items-center gap-5">
        <p
          title={props.departure.tripName}
          className="w-[20ch] overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium"
        >
          {props.departure.tripName}
        </p>
        <CalendarPicker
          mode="range"
          className="rounded-md border"
          selected={{
            from: new Date(props.departure.startDate),
            to: new Date(props.departure.endDate),
          }}
          onSelect={(date) => {
            console.log(date);
          }}
          disableNavigation={true}
          disabled={true}
        >
          <button className="rounded-sm border bg-[#EBE8E8] px-3 py-2 text-sm">
            {`${startDate} - ${endDate}`}
          </button>
        </CalendarPicker>
      </div>
      <div className="flex items-center">
        <Dialog modal>
          <DialogTrigger asChild>
            <Button size="sm">Create</Button>
          </DialogTrigger>
          <DialogPortal>
            <DialogContent
              className="max-w-5xl"
              onInteractOutside={(e) => {
                e.preventDefault();
              }}
            >
              <AddSegment departure={props.departure} />
            </DialogContent>
          </DialogPortal>
        </Dialog>
      </div>
    </header>
  );
};

export default PlannerHeader;
