import dayjs from "dayjs";

export const dateRangeOverlaps = (
  a_start: Date,
  a_end: Date,
  b_start: Date,
  b_end: Date
) => {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
  if (b_start < a_start && a_end < b_end) return true; // a in b
  if (dayjs(a_end).add(2, "hour").isSame(dayjs(b_start))) return true; // b starts the next day a ends
  if (Math.abs(dayjs(a_end).diff(dayjs(b_start), "minutes")) < 120) return true; // b starts within 2 hours of a ending
  return false;
};

export const createGanttTimelines = <
  T extends { startDate: string; endDate: string },
>(
  data: T[]
) => {
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

        acc[lineIndex].push(segment);

        return acc;
      },
      [[]] as T[][]
    );
};

export const getItemPlacement = <
  T extends { startDate: string; endDate: string },
>(
  item: T,
  range: { startDate: string | Date; endDate: string | Date },
  dayWidth: number
) => {
  const diff = Math.abs(
    dayjs(item.startDate).diff(dayjs(range.startDate), "hour")
  );
  const hoursCount = dayjs(item.endDate).diff(item.startDate, "hour");
  const hourWidth = dayWidth / 24;

  return {
    width: hoursCount * hourWidth,
    position: diff * hourWidth,
    diff,
    hoursCount,
  };
};
