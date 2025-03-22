import { createContext, createSignal, useContext, type Accessor, type Setter, type Signal } from "solid-js";
import type { DataPoint } from "./interfaces";
 const AttentionContext = createContext<{signals: {[key :string ]: Signal<any>}}>();

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