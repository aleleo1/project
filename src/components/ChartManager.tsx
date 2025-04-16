import { useData } from "../contexts/dataContext";
import { formatDate, updateMainUrlRt, pushUrl } from "../utils";
import { useAttention } from "../contexts/attentionContext";

export default function ChartManager(p: any) {
    const { loadNewDataWithDate, date, rif, isRt } = useData()!.functions as any
    const { fullView } = useAttention()!.signals!
    const href = useData()!.signals!['href']
    const [isFullView, setFullView] = fullView

    return (
        <div class="flex flex-row gap-10 z-10 h-10">
            <input type="checkbox" class="w-10 h-10" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
            <input type="date" class="z-30" min={formatDate(date())} max={formatDate(new Date())} value={formatDate(rif())} onChange={(event: any) => event.target.value && new Date(event.target.value) > new Date(date()) && new Date(event.target.value) < new Date() ? loadNewDataWithDate('rif', event.target.value) : event.target.value = rif()}></input>
            <input type="date" class="z-30" max={formatDate(rif())} value={formatDate(date())} onChange={(event: any) => event.target.value && new Date(event.target.value) < new Date(rif()) ? loadNewDataWithDate('date', event.target.value) : event.target.value = date()}></input>
            <input type="checkbox" class="w-10 h-10" onChange={(ev) => pushUrl(updateMainUrlRt(href[0](), !!ev.target.checked ? p.index : -1))} checked={isRt()} />
        </div>
    );
}