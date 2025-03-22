import { createContext, createEffect, createSignal, type Setter } from "solid-js";
import Chart_2 from "./Chart_2";
import type { DataPoint } from './interfaces'
import { AttentionProvider, useAttention } from "./context";

function ChartContainer () {
    const da = useAttention()!.signals['dataAttention']
    
   return (
       <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
        <p class="w-10">{da[0]() ? da[0]()!.date.toString() : ''}</p>
       <img class="w-64 h-64" alt="no img" />
       <Chart_2></Chart_2>
     </div>
   )
}
export default function Container () {
    
    return (
        <AttentionProvider>
            <ChartContainer></ChartContainer>
        </AttentionProvider>
    )
  }

