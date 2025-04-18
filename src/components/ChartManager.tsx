import { useData } from "../contexts/dataContext";
import { formatDate, updateMainUrlRt, pushUrl } from "../utils";
import { useAttention } from "../contexts/attentionContext";

export default function ChartManager(p: any) {
    const { loadNewDataWithDate, date, rif, isRt } = useData()!.functions as any
    const { fullView } = useAttention()!.signals!
    const href = useData()!.signals!['href']
    const [isFullView, setFullView] = fullView
    const { dataAttention } = useAttention()!.signals!


    return (
        <div class="flex flex-col m-2">

            <div class="flex sm:flex-row flex-col gap-10 z-10 h-fit w-lvw justify-center">
                {/* <input type="checkbox" class="w-10 h-10" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} /> */}
                <input type="date" class="z-30" min={formatDate(date())} max={formatDate(new Date())} value={formatDate(rif())} onChange={(event: any) => event.target.value && new Date(event.target.value) > new Date(date()) && new Date(event.target.value) < new Date() ? loadNewDataWithDate('rif', event.target.value) : event.target.value = rif()}></input>
                <input type="date" class="z-30" max={formatDate(rif())} value={formatDate(date())} onChange={(event: any) => event.target.value && new Date(event.target.value) < new Date(rif()) ? loadNewDataWithDate('date', event.target.value) : event.target.value = date()}></input>
                <input type="checkbox" class="w-5 h-5" onChange={(ev) => pushUrl(updateMainUrlRt(href[0](), !!ev.target.checked ? p.index : -1))} checked={isRt()} />

            </div>

            <p class="min-h-32 text-sm sm:w-auto w-lvw text-wrap text-center m-2 p-2">{dataAttention[0]() ? (dataAttention[0]()).date.toString() : ''}</p>

        </div>
    );
}