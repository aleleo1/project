import { createContext, createEffect, createResource, createSignal, on, useContext, type Accessor, type ResourceReturn, type Setter, type Signal } from "solid-js";
import type { DataPoint } from "../interfaces";
import { createQuerySignal, delay, formatDate, getParams } from "../utils";
 const AttentionContext = createContext<{signals: {[key :string ]: Signal<any>}, data: {[key :string ]: ResourceReturn<DataPoint[]> }}>();

export function DataProvider(props: any) {
const refetch = createQuerySignal(['q1',(new Date())]);
const data = createResource<DataPoint[]>(refetch[2] ,() => props.data, {initialValue: props.data, deferStream: false})

/* createEffect(() => console.log(refetch[0]())) */
createEffect(on(refetch[0], fetchData, {defer: true}))
async function fetchData() {
    if (refetch[2]()){
        const response = await fetch(`/api/data${refetch[0]()}`, { method: 'GET',
            headers: {
            'Accept': 'application/json'
            }});
        if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        }
        const d = await response.json()
        //history.pushState(getParams(q), '', window.origin + refetch[0]())
        if (d.length < 300) {
            refetch[3](false)
        }
        data[1].mutate((prev)  => [...prev, ...d]);
    }
    console.log(`new len > 300 ? ${data[0]().length > 300}`)
    //return props.data
}



const dataAttention = createSignal<DataPoint | undefined>(undefined)

const provider = {signals: {dataAttention, refetch}, data: {data}}

    return (
        
        <AttentionContext.Provider value={provider}>

            {props.children}

        </AttentionContext.Provider>

    );
}

export function useData() { return useContext(AttentionContext); }