import { useMemo } from "react";
import dayjs from "dayjs";

import { dateRangeOverlaps } from "../helpers";

import { tripPlans } from "../constants";

export const useDeparture = <T extends { startDate: string; endDate: string }>(
  data?: T[]
) => {
  const gridData = useMemo(() => {
    if (!data) return [];

    return data
      .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
      .reduce(
        (acc, segment) => {
          // Find a line where this segment does not overlap with any existing segment
          let lineIndex = 0;

          while (lineIndex < acc.length) {
            const line = acc[lineIndex];
            const isOverlap = line.some((existingSegment) =>
              dateRangeOverlaps(
                new Date(existingSegment.startDate),
                new Date(existingSegment.endDate),
                new Date(segment.startDate),
                new Date(segment.endDate)
              )
            );
            if (!isOverlap) {
              break;
            }
            lineIndex++;
          }

          // If no line without overlap was found, create a new line
          if (lineIndex === acc.length) {
            acc.push([]);
          }

          // Render segment on the determined line
          acc[lineIndex].push(segment);

          return acc;
        },
        [[]] as T[][]
      );
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
