import { createEffect, createMemo, createSignal, on } from "solid-js";
import { useData } from "../contexts/dataContext";
import { formatDate, searchParamsToObject, updateMainURL, updateUrl } from "../utils";
import { DEFAULT_INITIAL_STATE } from "../constants";
import { useAttention } from "../contexts/attentionContext";

export default function ChartManager(p: any) {
    const refetch = useData()!.signals!['refetch']
    const rif = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).rif)
    const customRif = createSignal(rif())
    const date = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date)
    const customDate = createSignal(date())
    const [isFullView, setFullView] = useAttention()!.signals!['fullView']

    //createEffect(() => history.pushState({}, '', updateMainURL(window.location.href, JSON.stringify({ q: p.q, date: customDate[0](), rif: customRif[0]() }), p.index)), { defer: true })
    return (
        <div class="flex flex-row">
            <input type="checkbox" class="w-10" onChange={(ev) => setFullView(ev.target.checked)} checked={isFullView()} />
            <input type="date" class="z-30" min={formatDate(rif())} max={formatDate(date())} value={formatDate(customRif[0]())} onChange={(event: any) => customRif[1](new Date(event.target.value ?? rif()))}></input>
            <input type="date" class="z-30" min={formatDate(rif())} max={formatDate(date())} value={formatDate(customDate[0]())} onChange={(event: any) => customDate[1](new Date(event.target.value ?? date()))}></input>
        </div>
    );
}