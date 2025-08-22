import { batch, createEffect, createMemo, createResource, createSignal, on, onCleanup, onMount, Show } from "solid-js";
import Plot from "./Plot";
import type { DataPoint, QueryParams } from "../interfaces";
import usePlotVariables from "./utils/plotUtils";
import { DEFAULT_INITIAL_STATE, Actions } from "../constants";
import { createQuerySignal, isRtState, searchParamsToObject, intervalManager, randomizeFutureDate, randomizeDifferentNumber, formatDate } from "../utils";

function ChartContainer(p: any) {
  const vars = usePlotVariables()
  const refetch = createQuerySignal(p.url);

  const href = createSignal(p.initialUrl)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const data = createResource<DataPoint[]>(refetch.at(2), () => p.data, { initialValue: p.data, deferStream: false })
  createEffect(on(href[0], (href) => {
    history.pushState({}, '', href);
  }, { defer: true }))

  const [gHref, setHref] = href
  const idx = () => data[0]()!.at(0)!.idx
  const rif = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).rif)
  const date = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date)
  const q = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).q)
  const action = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).action)

  const intervalId = createSignal('')

  onCleanup(() => {
    const interval = intervalManager.getStatus(intervalId[0]())
    if (interval && interval.isRunning) {
      intervalManager.delete(intervalId[0]())
    }
  })
  createEffect(on(refetch[0], fetchData, { defer: true }))
  async function fetchData() {
    batch(async () => {
      console.log('fetching data...', refetch[0]())
      const fetchUrl = new URL(refetch[0]())
      fetchUrl.pathname = '/api/data'
      const response = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const d = await response.json()
      if (d.length === 0) {
        console.log('nothing else')
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        refetch.at(3)!(false)
      } else {
        data[1].mutate((prev) => action() === Actions.partial ? [...d, ...prev] : [...d]);
      }
      console.log(`fetched ${d.length} elements, new data length of ${data[0]().length}`)
      href[1](refetch.at(0)!())
    })
  }


  function loadNewData() {
    const url = new URL(refetch[0]())
    const q = url.searchParams.get('q')
    const d = new Date(url.searchParams.get('date')!)
    d.setMonth(d.getMonth() - 6)
    // eslint-dable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    refetch[1]({ q: q, date: formatDate(d), action: Actions.partial, idx: idx() })
  }

  return (
    <div class="flex flex-col">
      <div class="flex sm:flex-row flex-col gap-28 items-center justify-between w-full overflow-hidden m-3 p-3">
        <Show when={!data[0].error && data[0]()!.length}>
          <div class="flex flex-col">
            <Plot formData={vars} dataS={data[0]} load={loadNewData} refetch={refetch}></Plot>
          </div>
        </Show>
      </div>
    </div>

  )
}
export default function Container(p: { data: DataPoint[], initialState: QueryParams, url: string, dw: number, tmpUrl: string, download: number }) {
  for (let i = 0; i < (p.initialState.num ?? 1); i++) {
    return (
      <ChartContainer data={p.data} url={p.url} initialState={p.initialState} download={p.download} initialUrl={p.tmpUrl}></ChartContainer>
    )
  }
}

