import { createContext, createMemo, createSignal, createUniqueId, useContext, } from "solid-js";
import type { Context } from "../interfaces";
import { scaleUtc, scaleLinear, max, zoom, select, zoomIdentity } from "d3";
import { useData } from "./dataContext";
import { get_DEFAULT_DATES } from "../utils";
import { isServer } from "solid-js/web";


const ChartContext = createContext<Context>();

export function ChartProvider(props: any) {
    const id = createUniqueId()
    const containerId = createUniqueId();

    const [dataS] = useData()!.data!['data']
    const margin = { top: 30, right: 50, bottom: 120, left: 100 };
    const height = 350 - margin.top - margin.bottom;
    const isRt = useData()!.functions!['isRt']
    const defaultXY = `translate(${margin.left},${margin.top}) scale(1)`
    const [getN, setN] = createSignal(10)
    const [kZoom, setKZoom] = createSignal(1)
    const defaultWidth = (!isServer ? window.innerWidth : props.dw) * 2 / 3
    const getFirstDate = createMemo(() => {
        if (!isRt()) {
            const date = new Date(dataS()![0].date) > new Date(get_DEFAULT_DATES()[0]) ? new Date(dataS()![0].date) : new Date(get_DEFAULT_DATES()[0])
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
    }
    )

    //ASSE Y
    const yScale = scaleLinear()
        .nice()
        .range([height, 0]);
    const y = createMemo(() => yScale.domain([0, max(dataS()!, d => d.close)! ?? 1]))
    const containerClass = `w-[${defaultWidth}px]`


    const isZooming = createMemo(() => kZoom() > 1)



    // Store the zoom behavior as a variable to access it later
    const myZoom = zoom<SVGGElement, unknown>()
        .scaleExtent([0.5, 5]) // Limit zoom scale: min 0.5x, max 5x
        .translateExtent([[-100, -10], [divWidth + margin.left + margin.right, height + margin.top + margin.bottom]]) // Limit the area that can be viewed
        .on('zoom', handleZoom);


    // Updated zoom handler
    function handleZoom(e: d3.D3ZoomEvent<SVGGElement, unknown>) {
        const xy = select(`#${id}-xy`);
        // Get current transform
        const x = e.transform.x;
        const y = e.transform.y;
        const k = e.transform.k;
        if (k === 1) return

        if (getN() > 10) setKZoom(k)
        console.log(x, y, k);
        xy.attr('transform', `translate(${x},${y}) scale(${k})`);
    }

    // Reset function that properly resets zoom transform
    function restoreDefaultWidth() {
        setN(10);
        setKZoom(1);
        select(`#${id}`).transition()
            .call((myZoom as any).transform, zoomIdentity.translate(100, 30).scale(1));
    }

    function initZoom() {
        const elem = select(`#${id}`)
        elem.call(myZoom as any).on("wheel.zoom", null);
        elem.on('dblclick', (e: any) => {
            if (getN() <= 30) { setN(getN() + 10) }

        })

    }


    const provider = {
        accessors: { y, getXTicks, x, isZooming }, constants: { containerClass,containerId , margin, height, defaultWidth, divWidth, id }, functions: { initZoom, restoreDefaultWidth }
    }
    return (
        <ChartContext.Provider value={provider}>
            {props.children}
        </ChartContext.Provider>
    );
}

export function useChart() { return useContext(ChartContext); }