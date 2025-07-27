import { createContext, createMemo, createSignal, createUniqueId, onCleanup, useContext, type Signal, } from "solid-js";
import type { Context } from "../interfaces";
import { scaleUtc, scaleLinear, max, zoom, select, zoomIdentity } from "d3";
import { useData } from "./dataContext";
import { biggerNotNullDate, get_DEFAULT_DATES } from "../utils";
import { isServer } from "solid-js/web";
import type { RectangleData, RectangleDrawer } from "../components/utils/RectangleDrawer";

const zoomMap = [1.2, 1.6, 2, 2.4]
const ChartContext = createContext<Context>();

export function ChartProvider(props: any) {
    const [boundaries, setBounds] = createSignal([-1, -1]);
    const [buffBounds, setBuffBounds] = createSignal([-1, -1])
    const [drawer, setDrawer] = createSignal<RectangleDrawer | null>(null);

    const id = createUniqueId()
    const containerId = createUniqueId();
    const [dataS] = useData()!.data!['data']
    const margin = { top: 30, right: 50, bottom: 120, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const isRt = useData()!.functions!['isRt']
    const [getN, setN] = createSignal(10)
    const [isDrawingEnabled, setIsDrawingEnabled] = createSignal(false);
    const [zoomCounter, setZoomCounter] = createSignal(0)
    const defaultWidth = (!isServer ? window.innerWidth : props.dw) * 2 / 3

    const getFirstDate = createMemo(() => {
        if (boundaries()[0] && boundaries()[0] !== -1 && boundaries()[1] && boundaries()[1] !== -1 && zoomCounter() > 0) {
            return new Date(dataS()![boundaries()[0]].date)
        }
        if (!isRt()) {
            const date = biggerNotNullDate(new Date(dataS()![0].date), new Date(get_DEFAULT_DATES()[0]))
            return date
        } else {
            const data = dataS();
            const date = new Date(data![0].date)
            date.setMonth(date.getMonth() + 1)
            return new Date(date)
        }
    });

    const getLastDate = createMemo(() => {
        const data = dataS();
        if (boundaries()[0] && boundaries()[0] !== -1 && boundaries()[1] && boundaries()[1] !== -1 && zoomCounter() > 0) {
            return new Date(data![boundaries()[1]].date);
        }
        return new Date(data![data!.length - 1].date)
    });


    const divWidth = defaultWidth + (margin.left + margin.right)


    const range = [0, defaultWidth];

    const x = createMemo(() => {
        const firstDate = getFirstDate()
        const lastDate = getLastDate();

        return scaleUtc([firstDate, lastDate], range);
    });

    const getXTicks = createMemo(() => {
        const start = getFirstDate()
        return Array.from({ length: (getN()) }, (_, i) =>
            new Date(start.getTime() + (i / (getN())) * (getLastDate().getTime() - start.getTime())))
    })

    //ASSE Y
    const yScale = scaleLinear()
        .nice()
        .range([height, 0]);
    const y = createMemo(() => yScale.domain([0, max(dataS()!, d => d.close)! ?? 1]))
    const containerClass = `w-[${defaultWidth}px]`


    // Reset function that properly resets zoom transform
    function restoreDefaultWidth() {
        setN(10);
        setIsDrawingEnabled(true)
        setZoomCounter(0)
        setBounds([-1, -1])
    }

    function initZoom() {
        const elem = select(`#${id}`)
        elem.on("wheel.zoom", null);
        elem.on('dblclick', null)
    }

    const handleRectanglesCleared = () => {
        if (!dataS()![buffBounds()[0]] ||
            !dataS()![buffBounds()[1]]) {
            return
        }
        if (getN() < 30) { setN(getN() + 10) }
        if (zoomCounter() >= 4) {
            setIsDrawingEnabled(false)
            return
        } else {
            setZoomCounter((prev) => prev + 1)

        }
        setBounds(buffBounds())
        setBuffBounds([-1, -1])

    };

    const orderNumsArr = (arr: number[]) => { return arr.sort((a, b) => a - b) }

    const setBoundaries = (index: number) => {
        if (drawer()?.getIsDrawing()) {
            setBuffBounds(orderNumsArr(buffBounds()[0] === -1 ? [index, buffBounds()[1]] : [buffBounds()[0], index]))
        }
    }

    const provider = {
        accessors: { y, getXTicks, x, isDrawingEnabled, drawer, boundaries }, constants: { containerClass, containerId, margin, height, defaultWidth, divWidth, id }, functions: { initZoom, restoreDefaultWidth, handleRectanglesCleared, setIsDrawingEnabled, setBoundaries, setDrawer }
    }

    onCleanup(() => {
        setDrawer(null)
    })

    return (
        <ChartContext.Provider value={provider as any}>
            {props.children}
        </ChartContext.Provider>
    );
}

export function useChart() { return useContext(ChartContext); }