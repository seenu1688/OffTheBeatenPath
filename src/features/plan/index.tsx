"use client";

import { Button } from "@/components/button";

import { Departure } from "@/common/types";

type Props = {
  departure: Departure;
};

const DeparturePlanner = (props: Props) => {
  return (
    <div className="overflow-hidden">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-[#f7f7f7] px-6 py-3">
        <p className="w-[20ch] overflow-hidden overflow-ellipsis whitespace-nowrap text-lg font-medium">
          {props.departure.tripName}
        </p>
        <div className="flex items-center">
          <Button size="sm">Create</Button>
        </div>
      </header>
    </div>
  );
};

export default DeparturePlanner;
