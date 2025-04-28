import { useData } from "../contexts/dataContext";
import { updateMainUrlRt } from "../utils";
import { useAttention } from "../contexts/attentionContext";
import { useChart } from "../contexts/chartContext";
import { Show } from "solid-js";
import DatePickers from "./utils/DatePicker";

export default function ChartManager(p: any) {
    const { isRt } = useData()!.functions as any
    const href = useData()!.signals!['href']
    const { dataAttention } = useAttention()!.signals!
    const { restoreDefaultWidth } = useChart()!.functions as any
    const download = useData()!.constants!['download']

    return (
        <div class="flex flex-col m-2">
            <div class="flex sm:flex-row flex-col gap-10 z-10 h-fit w-lvw justify-start relative">
                <DatePickers />
                <Show when={!download}>
                    <fieldset class="fieldset bg-base-100 border-base-300 rounded-box w-64 border p-4">
                        <legend class="fieldset-legend">Real Time</legend>
                        <label class="label">
                            <input type="checkbox" class="checkbox" onChange={(ev) => href[1](updateMainUrlRt(href[0](), !!ev.target.checked ? p.index : -1))} checked={isRt()} />
                        </label>
                    </fieldset>
                    <button class="btn btn-primary" onClick={restoreDefaultWidth}>Restore defaultWidth</button>
                </Show>
            </div>
            <p class="min-h-32 text-sm sm:w-auto w-lvw text-wrap text-center m-2 p-2">{dataAttention[0]() ? (dataAttention[0]()).date.toString() : ''}</p>
        </div>
    );
}