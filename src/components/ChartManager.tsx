import { createMemo } from "solid-js";
import { useData } from "../contexts/dataContext";
import { formatDate, searchParamsToObject, updateMainURL, updateUrl } from "../utils";
import { DEFAULT_INITIAL_STATE } from "../constants";
import { useAttention } from "../contexts/attentionContext";

export default function ChartManager(p: any) {
    const refetch = useData()!.signals!['refetch']
    const loadNewDataWithDate = useData()!.functions!['loadNewDataWithDate'] as any
    const rif = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).rif)
    const date = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date)
    const [isFullView, setFullView] = useAttention()!.signals!['fullView']

    return (
        <div class="flex flex-row gap-10 z-10 h-10">
            <input type="checkbox" class="w-10 h-10" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
            <input type="date" class="z-30" min={formatDate(date())} max={formatDate(new Date())} value={formatDate(rif())} onChange={(event: any) => event.target.value && new Date(event.target.value) > new Date(date()) ? loadNewDataWithDate('rif', event.target.value) : event.target.value = rif()}></input>
            <input type="date" class="z-30" max={formatDate(rif())} value={formatDate(date())} onChange={(event: any) => event.target.value && new Date(event.target.value) < new Date(rif()) ? loadNewDataWithDate('date', event.target.value) : event.target.value = date()}></input>
        </div>
    );
}