import { createContext, createSignal, useContext, } from "solid-js";
import type { Context, DataPoint } from "../interfaces";


const AttentionContext = createContext<Context>();

export function AttentionProvider(props: any) {

    const dataAttention = createSignal<DataPoint | undefined>(undefined)
    const fullView = createSignal(true)
    const provider = { signals: { dataAttention, fullView } }

    return (

        <AttentionContext.Provider value={provider}>

            {props.children}

        </AttentionContext.Provider>

    );
}

export function useAttention() { return useContext(AttentionContext); }