import { createContext, createEffect, createMemo, createResource, createSignal, on, onCleanup, onMount, useContext } from "solid-js";
import type { Context, Data, QueryParams } from "../interfaces";
import { createQuerySignal, extractStates, formatDate, IntervalManager, isRtState, pushUrl, randomizeDifferentNumber, randomizeFutureDate, searchParamsToObject, updateMainURL } from "../utils";
import { Actions, DEFAULT_INITIAL_STATE } from "../constants";
const DataContext = createContext<Context>();

export function DataProvider(props: any) {

    const refetch = createQuerySignal(props.url);
    const intervalManager = new IntervalManager();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const data = createResource<Data[]>(refetch.at(2), () => props.data, { initialValue: props.data, deferStream: false })
    onMount(() => {

        window.addEventListener('popstate', () => {
            setHref(window.location.href)

            if (searchParamsToObject(new URL(extractStates(new URL(window.location.href).searchParams)[props.index]).searchParams.toString(), DEFAULT_INITIAL_STATE).date > date()) {
                window.location.reload()
            }

            if (extractStates(new URL(gHref()).searchParams).length === 1 && !isRt()) {
                window.location.href = new URL(gHref()).origin
            }

        })

    })
    const href = createSignal(window.location.href)
    const [gHref, setHref] = href
    createEffect(on(href[0], () => window.document.title = isRt() ? "Real Time" : "Storico"))
    const isRt = createMemo(() => isRtState(gHref(), props.index))
    const rif = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).rif)
    const date = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date)
    const q = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).q)
    const action = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).action)
    const dataS = createMemo(() =>
        data[0]().filter(d => new Date(d.date) <= new Date(rif()) && new Date(d.date) >= new Date(date()))
    )
    const intervalId = createSignal('')
    createEffect(on(isRt, (val, prev) => {
        if (val) {
            intervalId[1](intervalManager.create(() => {
                data[1].mutate((prev) => {
                    // Example usage:
                    // Generate a random future date
                    const randomFutureDate = randomizeFutureDate(prev[0].date, 5); // Random date within the next 30 days

                    // Generate a random number different from 7 in the range 1-10
                    const randomDifferentNumber = randomizeDifferentNumber(prev[0].close, 1, 100);
                    console.log('running interval with value: ', { date: randomFutureDate, close: randomDifferentNumber, sensor: 'RANDOM' })
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    refetch[1]({ q: q(), action: action(), data: date(), rif: randomFutureDate })
                    return [
                        { date: randomFutureDate, close: randomDifferentNumber, sensor: 'RANDOM' }, ...prev]
                })
            }, 5))
            intervalManager.start(intervalId[0]())
        } else {
            if (prev) {
                const interval = intervalManager.getStatus(intervalId[0]())
                if (interval && interval.isRunning) {
                    intervalManager.delete(intervalId[0]())
                }
            }
        }
    }))
    onCleanup(() => {
        const interval = intervalManager.getStatus(intervalId[0]())
        if (interval && interval.isRunning) {
            intervalManager.delete(intervalId[0]())
        }
    })
    createEffect(on(refetch[0], fetchData, { defer: true }))
    async function fetchData() {
        if (isRt()) { pushUrl(updateMainURL(gHref(), refetch.at(0)!(), props.index)); return }
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
            const action = searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).action
            data[1].mutate((prev) => action === Actions.partial ? [...prev, ...d] : [...d]);
        }
        console.log(`fetched ${d.length} elements, new data length of ${data[0]().length}`)
        pushUrl(updateMainURL(gHref(), refetch.at(0)!(), props.index))

    }

    function loadNewDataWithScroll(event: any) {
        const el = event.target;
        const scrollWidth = el.scrollWidth;
        const clientWidth = el.clientWidth;
        if (el.scrollLeft + clientWidth >= scrollWidth && !data[0].loading) {
            loadNewData()
            el.scrollLeft = scrollWidth - clientWidth - 20;
        }

    }

    function loadNewData() {
        const url = new URL(refetch[0]())
        const q = url.searchParams.get('q')
        const d = new Date(url.searchParams.get('date')!)
        d.setMonth(d.getMonth() - 6)
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        refetch[1]({ q: q, date: formatDate(d), action: Actions.partial })
    }

    const loadNewDataWithDate = (prop: keyof QueryParams, value: Date) => refetch[1]({ [prop]: value, action: Actions.full } as any)

    const provider = { signals: { refetch, href }, data: { data }, functions: { loadNewDataWithScroll, loadNewData, loadNewDataWithDate, rif, date, dataS, isRt } }

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <DataContext.Provider value={provider}>
            {props.children}
        </DataContext.Provider>

    );
}

export function useData() { return useContext(DataContext); }