import type { Signal, ResourceReturn, Accessor, InitializedResourceReturn } from "solid-js";


export interface DataPoint {
  date: Date;
  close: number;
  idx: number;
}

export interface MySQLAdapterConfig {
  host?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: number;
  connectionLimit?: number;
}

export interface Stato {
  full?: boolean;

}


export interface QueryParams {
  action: string;
  date: Date;
  num: number;
  rif: Date;
  idx: number;
}
export type UrlParams =
  {
    c: QueryParams[]
  }


export type ContainerData = { result: DataPoint[], state: QueryParams }

export type Context = Partial<{ signals: { [key: string]: Signal<any> }, data: { [key: string]: ResourceReturn<DataPoint[]> }, functions: { [key: string]: () => any }, accessors: { [key: string]: Accessor<any> }, constants: { [key: string]: any } }>




/**
 * @interface UsePlotVariablesOptions
 * @description Defines the options available for initializing the usePlotVariables Solid.js hook.
 * These options provide initial values for chart dimensions and step size.
 */
export interface UsePlotVariablesOptions {
  /**
   * @property {number} [width] - Optional initial width for the chart. Defaults to 1400 if not provided.
   */
  width?: number;

  /**
   * @property {number} [height] - Optional initial height for the chart. Defaults to 400 if not provided.
   */
  height?: number;

  /**
   * @property {number} [tickCount] - Optional initial number of ticks for the chart. Defaults to 20 if not provided.
   */
  tickCount?: number;

  /**
   * @property {number} [step] - Optional step size for incrementing/decrementing dimensions. Defaults to 50 if not provided.
   */
  step?: number;

  data?: any[];
}

/**
 * @interface UsePlotVariablesReturnType
 * @description Defines the return type of the usePlotVariables Solid.js hook.
 * It provides signals for chart dimensions, their setters, helper functions for
 * incrementing/decrementing, reset functions, and default values.
 */
export interface UsePlotVariablesReturnType {
  /**
   * @property {() => number} width - A Solid.js signal getter for the current chart width.
   */
  width: () => number;

  /**
   * @property {(value: number | ((prev: number) => number)) => void} setWidth - A Solid.js signal setter for the chart width.
   */
  setWidth: (value: number | ((prev: number) => number)) => void;

  /**
   * @property {() => number} height - A Solid.js signal getter for the current chart height.
   */
  height: () => number;

  /**
   * @property {(value: number | ((prev: number) => number)) => void} setHeight - A Solid.js signal setter for the chart height.
   */
  setHeight: (value: number | ((prev: number) => number)) => void;

  pt: () => 0 | 1;

  setPt: (value: number | ((prev: number) => number)) => void;

  /**
   * @property {() => number} tickCount - A Solid.js signal getter for the current tick count.
   */
  tickCount: () => number;

  /**
   * @property {(value: number | ((prev: number) => number)) => void} setTickCount - A Solid.js signal setter for the tick count.
   */
  setTickCount: (value: number | ((prev: number) => number)) => void;

  /**
   * @property {() => void} incrementWidth - Increments the width by the defined step.
   */
  incrementWidth: () => void;

  /**
   * @property {() => void} decrementWidth - Decrements the width by the defined step.
   */
  decrementWidth: () => void;

  /**
   * @property {() => void} incrementHeight - Increments the height by the defined step.
   */
  incrementHeight: () => void;

  /**
   * @property {() => void} decrementHeight - Decrements the height by the defined step.
   */
  decrementHeight: () => void;

  /**
   * @property {() => void} resetWidth - Resets the width to its default initial value.
   */
  resetWidth: () => void;

  /**
   * @property {() => void} resetHeight - Resets the height to its default initial value.
   */
  resetHeight: () => void;

  /**
   * @property {() => void} resetTickCount - Resets the tick count to its default initial value.
   */
  resetTickCount: () => void;

  /**
   * @property {() => void} resetAll - Resets all dimensions (width, height, tickCount) to their default initial values.
   */
  resetAll: () => void;

  plotType: () => string;
  plotTypes: string[]

  /**
   * @property {number} step - The constant step value used for incrementing/decrementing.
   */
  step: number;


  /**
   * @property {{width: number; height: number; tickCount: number;}} defaults - An object containing the default initial values for width, height, and tickCount.
   */
  defaults: {
    width: number;
    height: number;
    tickCount: number;
  };
}
export interface Rectangle {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    opacity: number;
}

export interface DateRange {
    startDate: Date;
    endDate: Date;
    dataPoints: any[];
}