import { useEffect, useState } from "react";
import dayjs from "dayjs";

import { Departure } from "@/common/types";

export type PlannerState = {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  width: number;
};

export const usePlanner = (departure: Departure) => {
  const [state, setState] = useState(() => {
    const startDate = dayjs(departure.startDate).startOf("day").toDate();
    const endDate = dayjs(departure.endDate).startOf("day").toDate();
    const dayCount = dayjs(endDate).diff(startDate, "day") + 1;

    return {
      startDate,
      endDate,
      dayWidth: 240,
      width: dayCount * 240,
    };
  });

  useEffect(() => {
    const startDate = dayjs(departure.startDate).startOf("day").toDate();
    const endDate = dayjs(departure.endDate).startOf("day").toDate();

    if (
      dayjs(startDate).isSame(state.startDate) &&
      dayjs(endDate).isSame(state.endDate)
    ) {
      return;
    }

    setState((prev) => {
      return {
        ...prev,
        startDate,
        endDate,
        dayCount: dayjs(endDate).diff(startDate, "day") + 1,
      };
    });
  }, [departure.startDate, departure.endDate, state.startDate, state.endDate]);

  return state;
};
