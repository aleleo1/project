import type { Signal, ResourceReturn } from "solid-js";

export interface DataPoint {
  date: Date;
  close: number;
  index?: number;
  path?: string;
}


export interface Data extends DataPoint {
  sensor: string;
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
  q: string;
  rif: Date;
}
export type UrlParams =
  {
    c: QueryParams[]
  }


export type ContainerData = { result: Data[], state: QueryParams }

export type Context = Partial<{ signals: { [key: string]: Signal<any> }, data: { [key: string]: ResourceReturn<Data[]> }, functions: { [key: string]: () => any } }>