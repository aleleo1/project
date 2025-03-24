import { createContext, createResource, createSignal, useContext, type Accessor, type ResourceReturn, type Setter, type Signal } from "solid-js";
import type { DataPoint } from "../interfaces";
import { delay } from "../utils";
 const AttentionContext = createContext<{signals: {[key :string ]: Signal<any>}, data: {[key :string ]: ResourceReturn<DataPoint[], unknown> }}>();

export function DataProvider(props: any) {
const dataAttention = createSignal<DataPoint | undefined>(undefined)
const data = createResource<DataPoint[]>( async () =>  {await delay(1000); return [
    { date: new Date("2020-01-01"), close: 150 },
    { date: new Date("2020-02-01"), close: 170 },
    { date: new Date("2020-03-01"), close: 160 },
    { date: new Date("2020-04-01"), close: 180 },
    { date: new Date("2020-05-01"), close: 210 },
    { date: new Date("2020-06-01"), close: 190 },
    { date: new Date("2020-07-01"), close: 220 },
    { date: new Date("2020-08-01"), close: 230 },
    { date: new Date("2020-09-01"), close: 200 },
    { date: new Date("2020-10-01"), close: 250 },
    { date: new Date("2020-11-01"), close: 270 },
    { date: new Date("2020-12-01"), close: 260 },
    { date: new Date("2021-01-01"), close: 280 },
    { date: new Date("2021-02-01"), close: 300 },
    { date: new Date("2021-03-01"), close: 290 },
    { date: new Date("2021-04-01"), close: 310 },
    { date: new Date("2021-05-01"), close: 320 },
    { date: new Date("2021-06-01"), close: 350 },
    { date: new Date("2021-07-01"), close: 340 },
    { date: new Date("2021-08-01"), close: 360 },
    { date: new Date("2021-09-01"), close: 370 },
    { date: new Date("2021-10-01"), close: 380 },
    { date: new Date("2021-11-01"), close: 400 },
    { date: new Date("2021-12-01"), close: 420 },
    { date: new Date("2022-01-01"), close: 430 },
    { date: new Date("2022-02-01"), close: 450 },
    { date: new Date("2022-03-01"), close: 440 },
    { date: new Date("2022-04-01"), close: 460 },
    { date: new Date("2022-05-01"), close: 480 },
    { date: new Date("2022-06-01"), close: 470 },
    { date: new Date("2022-07-01"), close: 490 },
    { date: new Date("2022-08-01"), close: 510 },
    { date: new Date("2022-09-01"), close: 500 },
    { date: new Date("2022-10-01"), close: 520 },
    { date: new Date("2022-11-01"), close: 540 },
    { date: new Date("2022-12-01"), close: 530 },
    { date: new Date("2023-01-01"), close: 550 },
    { date: new Date("2023-02-01"), close: 570 },
    { date: new Date("2023-03-01"), close: 560 },
    { date: new Date("2023-04-01"), close: 590 },
    { date: new Date("2023-05-01"), close: 600 },
    { date: new Date("2023-06-01"), close: 620 },
    { date: new Date("2023-07-01"), close: 610 },
    { date: new Date("2023-08-01"), close: 630 },
    { date: new Date("2023-09-01"), close: 650 },
    { date: new Date("2023-10-01"), close: 640 },
    { date: new Date("2023-11-01"), close: 670 },
    { date: new Date("2023-12-01"), close: 680 },
    { date: new Date("2024-03-01"), close: 760 },
    { date: new Date("2024-04-01"), close: 790 },
    { date: new Date("2024-05-01"), close: 700 },
    { date: new Date("2024-06-01"), close: 720 },
    { date: new Date("2024-07-01"), close: 710 },
    { date: new Date("2024-08-01"), close: 730 },
    { date: new Date("2024-09-01"), close: 750 },
    { date: new Date("2024-10-01"), close: 740 },
    { date: new Date("2024-11-01"), close: 770 },
    { date: new Date("2024-12-01"), close: 780 },
    { date: new Date("2025-05-01"), close: 800 },
    { date: new Date("2025-06-01"), close: 820 },
    { date: new Date("2025-07-01"), close: 810 },
    { date: new Date("2025-08-01"), close: 830 },
    { date: new Date("2025-09-01"), close: 850 },
    { date: new Date("2025-10-01"), close: 840 },
    { date: new Date("2025-11-01"), close: 870 },
    { date: new Date("2025-12-01"), close: 880 },
    { date: new Date("2026-10-01"), close: 840 },
    { date: new Date("2026-11-01"), close: 870 }
  ] })
const provider = {signals: {dataAttention}, data: {data}}

    return (
        
        <AttentionContext.Provider value={provider}>

            {props.children}

        </AttentionContext.Provider>

    );
}

export function useData() { return useContext(AttentionContext); }