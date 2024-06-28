"use client";

import dayjs from "dayjs";
import {
  CalendarRangeIcon,
  BarChart4,
  ChevronDown,
  WandSparkles,
  Share,
  Share2,
} from "lucide-react";

import { Button } from "@/components/button";
import DepartureDatesForm from "./DepartureDatesForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogPortal,
} from "@/components/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/dropdown-menu";
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
          <DialogTrigger asChild>
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
      <div className="flex items-center gap-8 pr-6 text-[#343434]">
        <Dialog modal>
          <DialogTrigger asChild>
            <Button size="sm" className="px-6">
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
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 text-sm">
            <BarChart4 size={14} />
            <span>Generate</span>
            <ChevronDown size={15} />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Reservation Report</DropdownMenuItem>
            <DropdownMenuItem>Guidebook</DropdownMenuItem>
            <DropdownMenuItem>Travel Brief</DropdownMenuItem>
            <DropdownMenuItem>CTS Trip Description</DropdownMenuItem>
            <DropdownMenuItem>GTS Final Cover</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 font-normal"
        >
          <WandSparkles size={14} />
          <span>Clone</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 font-normal"
        >
          <Share2 size={14} />
          <span>View</span>
        </Button>
        <Button
          variant="ghost"
          className="flex items-center gap-2 px-0 font-normal"
        >
          <Share size={14} />
          <span>Export</span>
        </Button>
      </div>
    </header>
  );
};

export default PlannerHeader;
