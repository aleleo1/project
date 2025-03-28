import { onMount, Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "./dataContext";
import { AttentionProvider, useAttention } from "./attentionContext";

function ChartContainer () {
    const da = useAttention()!.signals['dataAttention']
    const data = useData()!.data['data']
    const [refetch] = useData()!.signals['refetch']
    onMount(() => {if(!new URL(location.href).searchParams.get('rif')) {history.pushState({}, '', refetch())}})
    return (
       <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
        <p class="w-10">{da[0]() ? da[0]()!.date.toString() : ''}</p>
       <img class="w-64 h-64" alt="no img" />
       <Show when={!data[0].error}>
            <Chart_2></Chart_2>
       </Show>
     </div>
   )
}
export default function Container (p: {data: any, initialState: any}) {
    return (
        <DataProvider data={p.data} initialState={p.initialState}>
          <AttentionProvider>
              <ChartContainer></ChartContainer>
          </AttentionProvider>
          <AttentionProvider>
              <ChartContainer></ChartContainer>
          </AttentionProvider>
        </DataProvider>
    )
  }

