import { onMount, Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "./context";
const delay = (ms: any) => new Promise(res => setTimeout(res, ms));

function ChartContainer () {
    const da = useData()!.signals['dataAttention']
    const data = useData()!.data['data']
    onMount(async () => {await delay(10000); data[1].mutate(
      [
      
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
      ]
    );console.log('muted!');} )
   return (
       <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
        <p class="w-10">{da[0]() ? da[0]()!.date.toString() : ''}</p>
       <img class="w-64 h-64" alt="no img" />
       <Show when={!data[0].loading && !data[0].error}>
            <Chart_2></Chart_2>
       </Show>
     </div>
   )
}
export default function Container () {
    
    return (
        <DataProvider>
            <ChartContainer></ChartContainer>
        </DataProvider>
    )
  }

