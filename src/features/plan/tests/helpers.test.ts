import { test, describe, expect } from "vitest";

import { dateRangeOverlaps } from "../helpers";
import dayjs from "dayjs";

describe("overlapping range", () => {
  test("should return true", () => {
    const a_start = dayjs("2024-01-01").toDate();
    const a_end = dayjs("2024-01-03").toDate();
    const b_start = dayjs("2024-01-02").toDate();
    const b_end = dayjs("2024-01-04").toDate();

    expect(dateRangeOverlaps(a_start, a_end, b_start, b_end)).toBe(true);
  });

  test("should return false", () => {
    const a_start = dayjs("2024-05-08T21:50:00.000+0000").toDate();
    const a_end = dayjs("2024-05-12T21:50:00.000+0000").toDate();
    const b_start = dayjs("2024-05-13T00:50:00.000+0000").toDate();
    const b_end = dayjs("2024-05-13T21:50:00.000+0000").toDate();

    expect(dateRangeOverlaps(a_start, a_end, b_start, b_end)).toBe(false);
  });

  test("should return true", () => {
    const a_start = dayjs("2024-05-08T18:00:00.000+0000").toDate();
    const a_end = dayjs("2024-05-08T18:00:00.000+0000").toDate();
    const b_start = dayjs("2024-05-08T18:30:00.000+0000").toDate();
    const b_end = dayjs("2024-05-09T18:30:00.000+0000").toDate();

    expect(dateRangeOverlaps(a_start, a_end, b_start, b_end)).toBe(true);
  });
});
