import { useData } from "../contexts/dataContext";
import { formatDate, updateMainUrlRt } from "../utils";
import { useAttention } from "../contexts/attentionContext";
import { useChart } from "../contexts/chartContext";
import { Show } from "solid-js";

export default function ChartManager(p: any) {
    const { loadNewDataWithDate, date, rif, isRt } = useData()!.functions as any
    const href = useData()!.signals!['href']
    const { dataAttention } = useAttention()!.signals!
    const { restoreDefaultWidth } = useChart()!.functions as any
    const download = useData()!.constants!['download']
    return (
        <div class="flex flex-col m-2">

            <div class="flex sm:flex-row flex-col gap-10 z-10 h-fit w-lvw justify-center">
                <input type="date" class="z-30" min={formatDate(date())} max={formatDate(new Date())} value={formatDate(rif())} onChange={(event: any) => event.target.value && new Date(event.target.value) > new Date(date()) && new Date(event.target.value) < new Date() ? loadNewDataWithDate('rif', event.target.value) : event.target.value = rif()}></input>
                <input type="date" class="z-30" max={formatDate(rif())} value={formatDate(date())} onChange={(event: any) => event.target.value && new Date(event.target.value) < new Date(rif()) ? loadNewDataWithDate('date', event.target.value) : event.target.value = date()}></input>
                <Show when={!download}>
                    <input type="checkbox" class="w-5 h-5" onChange={(ev) => href[1](updateMainUrlRt(href[0](), !!ev.target.checked ? p.index : -1))} checked={isRt()} />
                    <button class="btn-primary" onClick={restoreDefaultWidth}>Restore defaultWidth</button>
                </Show>
            </div>

            <p class="min-h-32 text-sm sm:w-auto w-lvw text-wrap text-center m-2 p-2">{dataAttention[0]() ? (dataAttention[0]()).date.toString() : ''}</p>

        </div>
    );
}