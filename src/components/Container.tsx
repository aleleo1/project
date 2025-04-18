import { Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "../contexts/dataContext";
import { AttentionProvider } from "../contexts/attentionContext";
import type { Data, QueryParams } from "../interfaces";
import { ChartProvider } from "../contexts/chartContext";
import ChartManager from "./ChartManager";
import { getRt, isRtState } from "../utils";
function ChartContainer(p: any) {
  const data = useData()!.data!['data']
  const href = useData()!.signals!['href']
  const isRt = useData()!.functions!['isRt']
  return (
    <Show when={isRt() || getRt(href[0]()) < 0}>
      <div class="flex flex-col">
        <div class="flex sm:flex-row flex-col gap-28 items-center justify-between w-full overflow-hidden m-3 p-3">
          <img class="min-w-64 min-h-64" alt="no img" />
          <Show when={!data[0].error && data[0]()!.length}>
            <ChartProvider>
              <div class="flex flex-col">
                <Chart_2></Chart_2>
                <ChartManager q={p.q} index={p.index}></ChartManager>
              </div>
            </ChartProvider>
          </Show>
        </div>
      </div>
    </Show>

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

