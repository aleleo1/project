import { createContext, createEffect, createResource, createSignal, on, useContext, type Accessor, type ResourceReturn, type Setter, type Signal } from "solid-js";
import type { DataPoint } from "../interfaces";
import { createQuerySignal, delay, formatDate, getParams } from "../utils";
 const AttentionContext = createContext<Partial<{signals: {[key :string ]: Signal<any>}, data: {[key :string ]: ResourceReturn<DataPoint[]> }, functions: {[key: string]: () => any}}>>();

export function DataProvider(props: any) {

const refetch = createQuerySignal(props.initialState);
const data = createResource<DataPoint[]>(refetch.at(2),() => props.data, {initialValue: props.data, deferStream: false})

createEffect(on(refetch[0], fetchData, {defer: true}))
async function fetchData() {
    if (refetch.at(2)!()){
        console.log('fetching data...')
        const response = await fetch(`/api/data${refetch[0]()}`, { method: 'GET',
            headers: {
            'Accept': 'application/json'
            }});
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        const d = await response.json()
        if (d.length === 0) {
            console.log('nothing else')
            refetch.at(3)!(false)
        } else {
            data[1].mutate((prev)  => [...prev, ...d]);
        }
        console.log(`fetched ${d.length} elements, new data length of ${data[0]().length}`)

    }
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
    const url = new URL(window.location.href)
    const q = url.searchParams.get('q')
    let d = new Date(url.searchParams.get('data')!)
    refetch[1]([q, d])
    if(refetch.at(2)!()){
      history.pushState([], '', refetch.at(0)!())
    }
}




const provider = {signals: {refetch}, data: {data}, functions: {loadNewDataWithScroll, loadNewData}}

    return (
        
        <AttentionContext.Provider value={provider}>

            {props.children}

        </AttentionContext.Provider>

    );
}

export function useData() { return useContext(AttentionContext); }