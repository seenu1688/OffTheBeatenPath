import dayjs from "dayjs";

export function dateRangeOverlaps(
  a_start: Date,
  a_end: Date,
  b_start: Date,
  b_end: Date
) {
  if (a_start <= b_start && b_start <= a_end) return true; // b starts in a
  if (a_start <= b_end && b_end <= a_end) return true; // b ends in a
  if (b_start < a_start && a_end < b_end) return true; // a in b
  if (dayjs(a_end).add(1, "day").isSame(dayjs(b_start))) return true; // b starts the next day a ends
  return false;
}
