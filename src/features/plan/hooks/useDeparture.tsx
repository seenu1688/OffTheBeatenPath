import { useMemo } from "react";

import { createGanttTimelines } from "../helpers";

import { tripPlans } from "../constants";

export const useDeparture = <T extends { startDate: string; endDate: string }>(
  data?: T[]
) => {
  const gridData = useMemo(() => {
    if (!data) return [];

    return createGanttTimelines(data);
  }, [data]);

  return gridData;
};

const departureData = tripPlans.reduce(
  (acc, plan) => {
    acc[plan.id] = [];

    return acc;
  },
  {} as { [key: string]: any[] }
);
