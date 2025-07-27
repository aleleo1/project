import { type Signal, createSignal } from "solid-js";
import type { QueryParams } from "./interfaces";
const DEFAULT_RIF = new Date()

export const get_DEFAULT_DATES = () => {
  const ACTUAL_DATE = new Date()
  const ACTUAL_DATE_MINUS_6 = new Date()
  ACTUAL_DATE_MINUS_6.setMonth(ACTUAL_DATE_MINUS_6.getMonth() - 6)
  const ACTUAL_DATE_MINUS_YEAR = new Date()
  ACTUAL_DATE_MINUS_YEAR.setFullYear(ACTUAL_DATE_MINUS_YEAR.getFullYear() - 1)
  return [ACTUAL_DATE_MINUS_6, ACTUAL_DATE_MINUS_YEAR]
}


export const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
export const formatDate = (d: Date) => ((typeof d === 'string' ? d : d.toISOString()).replace('T', ' ').slice(0, 10))

export const dateMinus6 = (d: Date) => { d.setMonth(d.getMonth() - 6); return d; }

// Custom signal creator function
export function createQuerySignal(url: string) {
  const [getValue, setValue] = createSignal<string>(url);
  const [callable, setCallable] = createSignal<boolean>(true)
  // Custom getter that returns formatted string
  const querySignal = [
    () => {
      return getValue() ?? '';
    },

    // Custom setter that takes an array of strings
    (input: Partial<QueryParams>) => {
      setValue(updateUrl(getValue(), input).toString());
    },
    () => { return callable() },
    (input: boolean) => setCallable(input)

  ];

  return querySignal as unknown as Signal<string>;
}

export const updateUrl = (url: string, params: Partial<QueryParams>) => {
  const newUrl = new URL(url)
  for (let key in params) {
    const value = Object(params)[key]
    if (value) {
      if (typeof value === 'object') {
        newUrl.searchParams.set(key, formatDate(value))
      } else newUrl.searchParams.set(key, value)
    }
  }
  return newUrl;
}

export function searchParamsToObject<T extends Record<string, any>>(
  search: string,
  template: T
): T {
  const params = new URLSearchParams(search);
  const result = {} as T;

  (Object.keys(template) as (keyof T)[]).forEach((key) => {
    const values = params.getAll(String(key));

    const isArray = Array.isArray(template[key]);

    if (isArray) {
      (result[key] as any) = values;
    } else {
      (result[key] as any) = values.length > 0 ? values[0] : undefined;
    }
  });

  return result;
}

export function extractStates(params: URLSearchParams): string[] {
  const c = params.get("c")
  return c ? JSON.parse(decodeURIComponent(c)) : []
}

export function updateMainURL(main: string, partial: string, index: number) {
  const mainURL = new URL(main)
  const states = extractStates(mainURL.searchParams)
  if (states.length) {
    states[index] = encodeURIComponent(partial)
  } else {
    states.push(encodeURIComponent(partial))
  }
  mainURL.searchParams.set('c', JSON.stringify(states))
  return mainURL.toString()
}

export function updateMainUrlRt(main: string, index: number) {
  const mainUrl = new URL(main)
  mainUrl.searchParams.set('rt', String(index))
  return mainUrl.toString();
}

export function isRtState(main: string, index: number) {
  const rt = getRt(main)
  return !!(Number(rt) >= 0 && Number(rt) === index)
}

export function getRt(main: string) {
  const mainUrl = new URL(main)
  const rtParam = mainUrl.searchParams.get('rt')
  const rt = rtParam ? Number(rtParam) : -1
  return rt
}

/* export const pushUrl = (href: string) => {
  history.pushState({}, '', href);
  window.dispatchEvent(new Event('popstate'));
}; */

interface IntervalInfo {
  callback: () => void;
  intervalInSeconds: number;
  isRunning: boolean;
  intervalId: number | null;
}

/**
 * Interface for interval status
 */
interface IntervalStatus {
  isRunning: boolean;
  intervalInSeconds: number;
}

/**
 * A utility to manage function execution at regular intervals
 */
class IntervalManager {
  private intervals: Record<string, IntervalInfo> = {};
  private idCounter: number = 0;

  /**
   * Creates an interval but does not start it
   * @param callback - The function to execute
   * @param intervalInSeconds - The interval between executions in seconds
   * @returns Unique ID for the created interval
   */
  create(callback: () => void, intervalInSeconds: number): string {
    const id = `interval_${this.idCounter++}`;
    this.intervals[id] = {
      callback,
      intervalInSeconds,
      isRunning: false,
      intervalId: null
    };
    return id;
  }

  /**
   * Starts an interval with the given ID
   * @param id - The interval ID
   * @param runImmediately - Whether to run the callback immediately
   * @returns Success status
   */
  start(id: string, runImmediately: boolean = false): boolean {
    const interval = this.intervals[id];
    if (!interval || interval.isRunning) {
      return false;
    }

    if (runImmediately) {
      interval.callback();
    }

    interval.intervalId = window.setInterval(interval.callback, interval.intervalInSeconds * 1000);
    interval.isRunning = true;

    return true;
  }

  /**
   * Stops an interval with the given ID
   * @param id - The interval ID
   * @returns Success status
   */
  stop(id: string): boolean {
    const interval = this.intervals[id];
    if (!interval || !interval.isRunning) {
      return false;
    }

    if (interval.intervalId !== null) {
      window.clearInterval(interval.intervalId);
    }
    interval.isRunning = false;
    interval.intervalId = null;

    return true;
  }

  /**
   * Changes the interval time
   * @param id - The interval ID
   * @param newIntervalInSeconds - The new interval time in seconds
   * @returns Success status
   */
  changeInterval(id: string, newIntervalInSeconds: number): boolean {
    const interval = this.intervals[id];
    if (!interval) {
      return false;
    }

    const wasRunning = interval.isRunning;

    // Stop if running
    if (wasRunning) {
      this.stop(id);
    }

    // Update interval time
    interval.intervalInSeconds = newIntervalInSeconds;

    // Restart if it was running
    if (wasRunning) {
      this.start(id, false);
    }

    return true;
  }

  /**
   * Gets the status of an interval
   * @param id - The interval ID
   * @returns Status object or null if not found
   */
  getStatus(id: string): IntervalStatus | null {
    const interval = this.intervals[id];
    if (!interval) {
      return null;
    }

    return {
      isRunning: interval.isRunning,
      intervalInSeconds: interval.intervalInSeconds
    };
  }

  /**
   * Deletes an interval
   * @param id - The interval ID
   * @returns Success status
   */
  delete(id: string): boolean {
    if (!(id in this.intervals)) {
      return false;
    }

    // Stop if running
    if (this.intervals[id].isRunning) {
      this.stop(id);
    }

    // Delete
    delete this.intervals[id];

    return true;
  }
}

export const intervalManager = new IntervalManager()

/**
 * Generates a random date that is later than the provided date
 * @param startDate - The date to generate a random date after
 * @param maxDaysToAdd - Maximum number of days to add (default: 365)
 * @returns A new Date object that is later than the input date
 */
export function randomizeFutureDate(startDate: Date, maxDaysToAdd: number = 365): Date {
  // Clone the start date to avoid modifying the original
  const result = new Date(startDate.getTime());

  // Generate a random number of milliseconds to add (between 1ms and maxDaysToAdd days)
  const minMillisecondsToAdd = 1; // At least 1 millisecond later
  const maxMillisecondsToAdd = maxDaysToAdd * 24 * 60 * 60 * 1000;
831804
  // Generate random milliseconds between min and max
  const millisecondsToAdd = Math.floor(
    Math.random() * (maxMillisecondsToAdd - minMillisecondsToAdd + 1) + minMillisecondsToAdd
  );

  // Add the random time to the start date
  result.setTime(result.getTime() + millisecondsToAdd);

  return result;
}

/**
 * Generates a random number that is different from the provided number
 * @param excludedNumber - The number to avoid returning
 * @param min - Minimum value of the range (inclusive, default: 0)
 * @param max - Maximum value of the range (inclusive)
 * @returns A random number different from excludedNumber
 */
export function randomizeDifferentNumber(
  excludedNumber: number,
  min: number = 0,
  max: number
): number {
  // Validate that the range has at least 2 numbers
  if (max - min < 1) {
    throw new Error('Range must include at least 2 numbers');
  }

  // Check if excluded number is outside the range
  if (excludedNumber < min || excludedNumber > max) {
    // If the number to avoid is outside our range, just return a random number in range
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // Generate random number from 0 to range size - 1
  let randomValue = Math.floor(Math.random() * (max - min));

  // Adjust the number to exclude the excluded value
  if (randomValue >= excludedNumber - min) {
    randomValue += 1;
  }

  return randomValue + min;
}


export function getDeviceDetails(userAgent: string) {
  // For logging/debugging
  const deviceInfo = {
    isMobile:
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      ),
    isTablet: /iPad|Android(?!.*Mobile)/i.test(userAgent),
    isDesktop:
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent,
      ),
    browser: getBrowserInfo(userAgent),
    os: getOSInfo(userAgent),
  };

  return deviceInfo;
}

function getBrowserInfo(userAgent: string) {
  if (userAgent.indexOf("Firefox") > -1) return "Firefox";
  if (userAgent.indexOf("Edge") > -1) return "Edge";
  if (userAgent.indexOf("Chrome") > -1) return "Chrome";
  if (userAgent.indexOf("Safari") > -1) return "Safari";
  if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident/") > -1)
    return "Internet Explorer";
  return "Unknown";
}

function getOSInfo(userAgent: string) {
  if (userAgent.indexOf("Windows") > -1) return "Windows";
  if (userAgent.indexOf("Mac") > -1) return "MacOS";
  if (userAgent.indexOf("Linux") > -1) return "Linux";
  if (userAgent.indexOf("Android") > -1) return "Android";
  if (userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1)
    return "iOS";
  return "Unknown";
}


export function biggerNotNullDate(date1: any, date2: any) {
  return new Date(date1) > new Date(date2) ? new Date(date1) : new Date(date2)
}