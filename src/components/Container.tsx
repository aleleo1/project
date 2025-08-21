import { Show } from "solid-js";
import Plot from "./Plot";
import { DataProvider, useData } from "../contexts/dataContext";
import type { DataPoint, QueryParams } from "../interfaces";
import usePlotVariables from "./utils/plotUtils";

function ChartContainer(p: any) {
  const data = useData()!.data!['data']
  const vars = usePlotVariables()
  
  return (
    <div class="flex flex-col">
      <div class="flex sm:flex-row flex-col gap-28 items-center justify-between w-full overflow-hidden m-3 p-3">
        <Show when={!data[0].error && data[0]()!.length}>
          <div class="flex flex-col">
            <Plot formData={vars}></Plot>
          </div>
        </Show>
      </div>
    </div>

  )
}
export default function Container(p: { data: DataPoint[], initialState: QueryParams, url: string, index: number, dw: number, tmpUrl: string, download: number }) {
  for (let i = 0; i < (p.initialState.num ?? 1); i++) {
    return (
      <DataProvider data={p.data} url={p.url} initialState={p.initialState} index={p.index} download={p.download} initialUrl={p.tmpUrl}>
        <h1 class="text-center">{p.initialState.q}</h1>
        <ChartContainer q={p.initialState.q} index={p.index} dw={p.dw}></ChartContainer>
      </DataProvider>
    )
  }
}

