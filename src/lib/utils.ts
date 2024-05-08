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
