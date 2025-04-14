import { createContext, createMemo, useContext, } from "solid-js";
import type { Context } from "../interfaces";
import { utcMonth, scaleUtc, scaleLinear, max } from "d3";
import { useAttention } from "./attentionContext";
import { useData } from "./dataContext";


const ChartContext = createContext<Context>();

export function ChartProvider(props: any) {
    const [dataS] = useData()!.data!['data']
    const margin = { top: 30, right: 50, bottom: 120, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const [isFullView,] = useAttention()!.signals!['fullView']

    //ASSE X
    const defaultWidth = 1000
    const getFirstDate = createMemo(() => {
        const data = dataS();
        return new Date(data![0].date)
    });


    const getLastDate = createMemo(() => {
        const data = dataS();
        return new Date(data![data!.length - 1].date)
    });

    const middleX = createMemo(() => {
        const firstDate = getFirstDate();
        const lastDate = getLastDate();
        return (utcMonth.count(lastDate, firstDate) + 1) * 100;
    });

    const xWidth = createMemo(() => {
        const isFullViewValue = isFullView();
        const middleXValue = middleX();
        return !isFullViewValue && middleXValue > defaultWidth ? middleXValue : defaultWidth;
    });

    const divWidth = createMemo(() => {
        const isFullViewValue = isFullView();
        return defaultWidth + (isFullViewValue ? (margin.left + margin.right) : 0);
    });

    const range = createMemo(() => [0, xWidth()]);

    const fullWidth = createMemo(() => {
        const isFullViewValue = isFullView();
        const xWidthValue = xWidth();
        return (!isFullViewValue ? xWidthValue : defaultWidth) + margin.left + margin.right;
    });

    const x = createMemo(() => {
        const firstDate = new Date();
        const lastDate = getLastDate();
        const rangeValue = range();
        return scaleUtc([firstDate, lastDate], rangeValue);
    });

    const getXTicks = createMemo(() =>
        Array.from({ length: (10) }, (_, i) =>
            new Date(new Date().getTime() + (i / (10)) * (getLastDate().getTime() - new Date().getTime())))
    )

    //ASSE Y
    const yScale = scaleLinear()
        .nice()
        .range([height, 0]);
    const y = createMemo(() => yScale.domain([0, max(dataS()!, d => d.close)! ?? 1]))
    const containerClass = createMemo(() => isFullView() ? `w-[${defaultWidth}px]` : 'w-full md:w-96 lg:w-[960px]')
    const provider = {
        accessors: { divWidth, y, containerClass, getXTicks, x, fullWidth }, constants: { margin, height }
    }
    return (
        <ChartContext.Provider value={provider}>
            {props.children}
        </ChartContext.Provider>
    );
}

export function useChart() { return useContext(ChartContext); }