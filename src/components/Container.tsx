import { onMount, Show } from "solid-js";
import Chart_2 from "./Chart_2";
import { DataProvider, useData } from "./dataContext";
import { AttentionProvider, useAttention } from "./attentionContext";
import { get_DEFAULT_INITIAL_STATE } from "../utils";
function ChartContainer () {
    const da = useAttention()!.signals!['dataAttention']
    const data = useData()!.data!['data']
    const [refetch] = useData()!.signals!['refetch']
  const [isFullView, setFullView] = useAttention()!.signals!['fullView']

    onMount(() => {if(!new URL(location.href).searchParams.get('rif')) {history.pushState({}, '', refetch())}})
    return (
       <div class="flex flex-row gap-28 items-center justify-center w-full overflow-hidden">
       
       <img class="w-64 h-64" alt="no img" />
       <input type="checkbox" onChange={(ev) => setFullView(ev.target.checked) } checked={isFullView()}/>
       <Show when={!data[0].error && data[0]()!.length}>
            <Chart_2></Chart_2>
       </Show>
     </div>
   )
}
export default function Container (p: {data: any, initialState: any}) {
  onMount(() => {
    if (!p.data || !p.data.length) {
      p.initialState = get_DEFAULT_INITIAL_STATE()
    }
  })
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

