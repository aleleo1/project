import { onMount, Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "./dataContext";
import { AttentionProvider, useAttention } from "./attentionContext";
import type { Data, QueryParams } from "../interfaces";
import { updateMainURL } from "../utils";
function ChartContainer() {
  const data = useData()!.data!['data']
  const [refetch] = useData()!.signals!['refetch']
  const [isFullView, setFullView] = useAttention()!.signals!['fullView']

  return (
    <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">

      <img class="w-64 h-64" alt="no img" />
      <input type="checkbox" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
      <Show when={!data[0].error && data[0]()!.length}>
        <Chart_2></Chart_2>
      </Show>
    </div>
  )
}
export default function Container(p: { data: Data[], initialState: QueryParams, url: string, index: number }) {
 // onMount(() => { if (!new URL(location.href).searchParams.get('c')) { history.pushState({}, '', updateMainURL(window.location.href, p.url, p.index)) } })

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

