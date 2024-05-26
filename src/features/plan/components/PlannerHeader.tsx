"use client";

import dayjs from "dayjs";
import { CalendarRangeIcon } from "lucide-react";

import { Button } from "@/components/button";
import DepartureDatesForm from "./DepartureDatesForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
} from "@/components/dialog";
import AddSegment from "../fragments/AddSegment";

import { cn } from "@/lib/utils";

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
        <Dialog>
          <DialogTrigger>
            <button
              className={cn(
                "flex items-center gap-2",
                "rounded-sm border bg-[#EBE8E8] px-3 py-2 text-sm",
                "w-[240px] pl-3 text-left font-normal"
              )}
            >
              <div>{`${startDate} - ${endDate}`}</div>
              <CalendarRangeIcon size={20} />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-xl -translate-y-3/4">
            <DepartureDatesForm departure={props.departure} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="flex items-center">
        <Dialog modal>
          <DialogTrigger asChild>
            <Button
              size="sm"
              // onClick={() => {
              //   mutate({
              //     pNewRes: {
              //       Departure__c: props.departure.id,
              //       Start_DateTime__c: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
              //       End_DateTime__c: dayjs().format("YYYY-MM-DDTHH:mm:ss.SSSZ"),
              //       Vendor__c: "001d0000021HWYkAAO",
              //       Experience__c: "a04d000001WrvdhAAB",
              //       Segment__c: "a0ENq000001pKybMAE",
              //     },
              //     pRecordName: "Meals",
              //   });
              // }}
            >
              Create
            </Button>
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
