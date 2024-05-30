import { useMemo } from "react";

import { createGanttTimelines } from "../helpers";

export const useDeparture = <T extends { startDate: string; endDate: string }>(
  data?: T[]
) => {
  const gridData = useMemo(() => {
    if (!data) return [];

    return createGanttTimelines(data);
  }, [data]);

  return gridData;
};
