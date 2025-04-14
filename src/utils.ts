import { type Signal, createSignal } from "solid-js";
import type { QueryParams } from "./interfaces";
const DEFAULT_RIF = new Date()

export const get_DEFAULT_DATES = () => {
  const ACTUAL_DATE = new Date()
  const ACTUAL_DATE_MINUS_6 = new Date()
  ACTUAL_DATE_MINUS_6.setMonth(ACTUAL_DATE_MINUS_6.getMonth() - 6)
  return [ACTUAL_DATE, ACTUAL_DATE_MINUS_6]
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

