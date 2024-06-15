import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";

import { Departure } from "@/common/types";

export type PlannerState = {
  startDate: Date;
  endDate: Date;
  dayWidth: number;
  width: number;
  dayCount: number;
  startOffset: number;
};

export const usePlanner = (departure: Departure) => {
  const [state, setState] = useState(() => {
    const startDate = dayjs(departure.startDate).toDate();
    const endDate = dayjs(departure.endDate).toDate();

    let dayCount = dayjs(endDate).diff(startDate, "day") + 1;
    const dayWidth = 240;

    if (dayCount < 7) {
      dayCount = 7;
    }

    return {
      startDate,
      endDate,
      dayWidth,
      width: dayCount * dayWidth + dayWidth + 100,
      dayCount,
    };
  });

  const startOffset = useMemo(() => {
    return dayjs(state.startDate).diff(
      dayjs(state.startDate).startOf("D"),
      "hour",
      true
    );
  }, [state.startDate]);

  useEffect(() => {
    const startDate = dayjs(departure.startDate).toDate();
    const endDate = dayjs(departure.endDate).toDate();

    if (
      dayjs(startDate).isSame(state.startDate) &&
      dayjs(endDate).isSame(state.endDate)
    ) {
      return;
    }

    setState((prev) => {
      const dayCount = dayjs(endDate).diff(startDate, "day") + 1;

      return {
        ...prev,
        startDate,
        endDate,
        dayCount,
        width: dayCount * prev.dayWidth + 2 * prev.dayWidth,
      };
    });
  }, [departure.startDate, departure.endDate, state.startDate, state.endDate]);

  return {
    ...state,
    startOffset,
  };
};
