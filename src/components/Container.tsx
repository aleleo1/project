import { Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "../contexts/dataContext";
import { AttentionProvider, useAttention } from "../contexts/attentionContext";
import type { Data, QueryParams } from "../interfaces";
import { ChartProvider } from "../contexts/chartContext";
function ChartContainer() {
  const data = useData()!.data!['data']
  const [isFullView, setFullView] = useAttention()!.signals!['fullView']
  const dataAttention = useAttention()!.signals!['dataAttention']
  return (
    <div class="flex flex-col">
      <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
        <img class="w-64 h-64" alt="no img" />
        <input type="checkbox" class="w-10  " onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
        <Show when={!data[0].error && data[0]()!.length}>
          <ChartProvider>
            <Chart_2></Chart_2>
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
          <ChartContainer></ChartContainer>
        </AttentionProvider>
      </DataProvider>
    )
  }
}

