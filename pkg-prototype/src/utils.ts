import { createSignal } from "solid-js";
import type { UsePlotVariablesOptions, UsePlotVariablesReturnType } from "./types";
export default function usePlotVariables(options: UsePlotVariablesOptions = {}): UsePlotVariablesReturnType {
    // Extract custom values or use defaults
    const defaultW = options.width ?? 1400;
    const defaultH = options.height ?? 400;
    const defaultN = options.tickCount ?? 20;
    const step = options.step ?? 50;
    // Signals for chart dimensions and configuration
    const [width, setWidth] = createSignal(defaultW);
    const [height, setHeight] = createSignal(defaultH);
    const [tickCount, setTickCount] = createSignal(defaultN);

    // Helper functions for increment/decrement
    const incrementWidth = () => setWidth(prev => prev + step);
    const decrementWidth = () => setWidth(prev => prev - step);
    const incrementHeight = () => setHeight(prev => prev + step);
    const decrementHeight = () => setHeight(prev => prev - step);

    // Reset functions
    const resetWidth = () => setWidth(defaultW);
    const resetHeight = () => setHeight(defaultH);
    const resetTickCount = () => setTickCount(defaultN);

    const [pt, setPt] = createSignal<0 | 1>(0)

    const plotTypes = ['discrete', 'continous']
    const plotType = () => plotTypes[pt()]

    const resetAll = () => {
        setWidth(defaultW);
        setHeight(defaultH);
        setTickCount(defaultN);
    };

    return {
        // Signal getters and setters
        width,
        setWidth,
        height,
        setHeight,
        tickCount,
        setTickCount,
        pt,
        setPt,
        plotType,
        plotTypes,
        // Helper functions
        incrementWidth,
        decrementWidth,
        incrementHeight,
        decrementHeight,
        // Reset functions
        resetWidth,
        resetHeight,
        resetTickCount,
        resetAll,
        // Constants
        step,
        defaults: {
            width: defaultW,
            height: defaultH,
            tickCount: defaultN
        }
    };
}