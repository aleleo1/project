import { Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "../contexts/dataContext";
import { AttentionProvider, useAttention } from "../contexts/attentionContext";
import type { Data, QueryParams } from "../interfaces";
import { ChartProvider } from "../contexts/chartContext";
import ChartManager from "./ChartManager";
function ChartContainer(p: any) {
  const data = useData()!.data!['data']
  const dataAttention = useAttention()!.signals!['dataAttention']
  return (
    <div class="flex flex-col">
      <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
        <img class="w-64 h-64" alt="no img" />
        <Show when={!data[0].error && data[0]()!.length}>
          <ChartProvider>
            <div class="flex flex-col">
              <Chart_2></Chart_2>
              <ChartManager q={p.q} index={p.index}></ChartManager>
            </div>
          </ChartProvider>
        </Show>
      </div>
      {<p class="h-8">{dataAttention[0]() ? JSON.stringify(dataAttention[0]()) : ''}</p>}
    </div>
  )
}
export default function Container(p: { data: Data[], initialState: QueryParams, url: string, index: number }) {
  for (let i = 0; i < (p.initialState.num ?? 1); i++) {
    return (
      <DataProvider data={p.data} url={p.url} initialState={p.initialState} index={p.index}>
        <AttentionProvider>
          <ChartContainer q={p.initialState.q} index={p.index}></ChartContainer>
        </AttentionProvider>
      </DataProvider>
    )
  }
}

