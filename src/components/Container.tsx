import { Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "./dataContext";
import { AttentionProvider, useAttention } from "./attentionContext";
import type { Data, QueryParams } from "../interfaces";
function ChartContainer() {
  const data = useData()!.data!['data']
  const [isFullView, setFullView] = useAttention()!.signals!['fullView']
  const dataAttention = useAttention()!.signals!['dataAttention']
  return (
    <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
      <img class="w-64 h-64" alt="no img" />
      <input type="checkbox" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
      <div class="flex flex-col">
        <Show when={!data[0].error && data[0]()!.length}>
          <Chart_2></Chart_2>
          {<p class="h-8">{dataAttention[0]() ? JSON.stringify(dataAttention[0]()) : ''}</p>}
        </Show>
      </div>
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

