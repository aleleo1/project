import { createContext, createEffect, createMemo, createResource, on, onMount, useContext } from "solid-js";
import type { Context, Data, QueryParams } from "../interfaces";
import { createQuerySignal, extractStates, formatDate, searchParamsToObject, updateMainURL } from "../utils";
import { Actions, DEFAULT_INITIAL_STATE } from "../constants";
const DataContext = createContext<Context>();

export function DataProvider(props: any) {

    const refetch = createQuerySignal(props.url);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const data = createResource<Data[]>(refetch.at(2), () => props.data, { initialValue: props.data, deferStream: false })
    onMount(() => {
        window.addEventListener('popstate', () => {
            if (searchParamsToObject(new URL(extractStates(new URL(window.location.href).searchParams)[props.index]).searchParams.toString(), DEFAULT_INITIAL_STATE).date > searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date) {
                window.location.reload()
            }
        })

    })

    const rif = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).rif)
    const date = createMemo(() => searchParamsToObject(new URL(refetch[0]()).searchParams.toString(), DEFAULT_INITIAL_STATE).date)
    const dataS = createMemo(() =>
        data[0]().filter(d => new Date(d.date) <= new Date(rif()) && new Date(d.date) >= new Date(date()))
    )

    createEffect(on(refetch[0], fetchData, { defer: true }))
    async function fetchData() {
        console.log('fetching data...', refetch[0]())
        const fetchUrl = new URL(refetch[0]())
        console.log(fetchUrl)
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
        history.pushState([], '', updateMainURL(window.location.href, refetch.at(0)!(), props.index))

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

    const provider = { signals: { refetch }, data: { data }, functions: { loadNewDataWithScroll, loadNewData, loadNewDataWithDate, rif, date, dataS } }

    return (
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        <DataContext.Provider value={provider}>
            {props.children}
        </DataContext.Provider>

    );
}

export function useData() { return useContext(DataContext); }