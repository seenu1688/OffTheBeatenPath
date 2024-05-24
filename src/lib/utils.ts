import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const debounce = (
  fn: (...params: any) => void | Promise<any>,
  delay: number
) => {
  let timeout: NodeJS.Timeout;

  return async (...args: any) => {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      timeout = setTimeout(() => {
        resolve(fn(...args));
      }, delay);
    });
  };
};

export const filter = <T>(
  locations: T[],
  callback: (location: T, index: number) => boolean | T
) => {
  const result: T[] = [];

  let index = 0;

  for (const location of locations) {
    const value = callback(location, index);

    if (typeof value === "boolean") {
      if (value) {
        result.push(location);
      }
    } else {
      result.push(value);
    }
    index++;
  }

  return result;
};

export const formatTimeString = (hour: number, minute: number) => {
  let ampm = hour < 12 ? "AM" : "PM";
  const hourString = (hour === 12 ? 12 : hour % 12).toString().padStart(2, "0");
  const minuteString = minute.toString().padStart(2, "0");

  return `${hourString}:${minuteString} ${ampm}`;
};

const generateTimeList = () => {
  let times = [];

  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 10) {
      times.push({
        label: formatTimeString(hour, minute),
        value: (hour * 60 + minute).toString(),
      });
    }
  }

  return times;
};

export const timesList = generateTimeList();
