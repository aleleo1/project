import { Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "../contexts/dataContext";
import { AttentionProvider } from "../contexts/attentionContext";
import type { Data, QueryParams } from "../interfaces";
import { ChartProvider } from "../contexts/chartContext";
import ChartManager from "./ChartManager";
function ChartContainer(p: any) {
  const data = useData()!.data!['data']
  return (

    <div class="flex flex-col">
      <div class="flex sm:flex-row flex-col gap-28 items-center justify-between w-full overflow-hidden m-3 p-3">
        <Show when={!data[0].error && data[0]()!.length}>
          <ChartProvider dw={p.dw}>
            <img class="min-w-64 min-h-64" alt="no img" />
            <div class="flex flex-col">
              <Chart_2></Chart_2>
              <ChartManager q={p.q} index={p.index}></ChartManager>
            </div>
          </ChartProvider>
        </Show>
      </div>
    </div>

  )
}
export default function Container(p: { data: Data[], initialState: QueryParams, url: string, index: number, dw: number, tmpUrl: string, download: number }) {
  for (let i = 0; i < (p.initialState.num ?? 1); i++) {
    return (

      <DataProvider data={p.data} url={p.url} initialState={p.initialState} index={p.index} download={p.download} initialUrl={p.tmpUrl}>
        <AttentionProvider>
          <ChartContainer q={p.initialState.q} index={p.index} dw={p.dw}></ChartContainer>
        </AttentionProvider>
      </DataProvider>
    )
  }
}

