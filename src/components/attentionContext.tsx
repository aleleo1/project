import { createContext, createEffect, createResource, createSignal, on, useContext, type Accessor, type ResourceReturn, type Setter, type Signal } from "solid-js";
import type { DataPoint } from "../interfaces";


 const AttentionContext = createContext<{signals: {[key :string ]: Signal<any>}, data: {[key :string ]: ResourceReturn<DataPoint[]> }}>();

export function AttentionProvider(props: any) {

const dataAttention = createSignal<DataPoint | undefined>(undefined)

const provider = {signals: {dataAttention}}

    return (
        
        <AttentionContext.Provider value={provider}>

            {props.children}

        </AttentionContext.Provider>

    );
}

export function useAttention() { return useContext(AttentionContext); }