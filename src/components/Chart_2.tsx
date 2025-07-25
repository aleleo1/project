import { For, Show, batch, createEffect, createSignal, createUniqueId, onMount } from "solid-js";
import { useData } from "../contexts/dataContext";
import { formatDate } from "../utils";
import { useAttention } from "../contexts/attentionContext";
import { useChart } from "../contexts/chartContext";
import SvgDrawingComponent from "./ChartWZoom";
export default function Chart_2() {
  let chartContainer: SVGSVGElement | undefined;
  let container;
  const { loadNewData, loadNewDataWithScroll, isRt } = useData()!.functions as any
  const da = useAttention()!.signals!['dataAttention']
  const { y, getXTicks, x, isZooming , isDrawingEnabled} = useChart()!.accessors as any
  const { containerId, margin, height, containerClass, divWidth, id } = useChart()!.constants as any
  const refetch = useData()!.signals!['refetch']
  const { initZoom, handleRectangleCreated, handleRectanglesCleared } = useChart()!.functions as any
  const dataS = useData()!.functions!['dataS']
  const download = useData()!.constants!['download']
  onMount(() => {
    initZoom()
  })



  createEffect(() => console.log(isZooming()))

  return (
    <div class={`p-10 ${containerClass}`}>
      <div id={`${containerId}`} ref={container} style={{ 'width': `${divWidth}`, height: '350px', 'overflow-x': 'auto', "overflow-y": 'hidden', "scroll-behavior": "smooth", "z-index": 100 }} onscroll={loadNewDataWithScroll}>
       
        <SvgDrawingComponent
          enableDrawing={isDrawingEnabled()}
          width={divWidth}
          height={1000}
          drawingOptions={{
            minSize: 0,
            height: height+margin.top,
            y: 0
          }}
          onRectangleCreated={handleRectangleCreated}
          onRectanglesCleared={handleRectanglesCleared}
        >

          <svg id={id} ref={chartContainer} style={{ display: 'block'}} width={divWidth} height="350" viewBox={`0 0 ${divWidth} 350`}>
            <Show when={!isRt() && !download}>
              <g onClick={loadNewData}>
                <rect fill="#333"
                  rx="4" ry="4"
                  cursor="pointer" x={divWidth - 104} y="0" width="95" height="25" />
                <text class="tooltip-text" x={divWidth - 100} y="16">{refetch.at(2)!() ? 'Load more data' : 'No more data'}</text>
              </g>
            </Show>
            <g id={`${id}-xy`} transform={`translate(${margin.left},${margin.top})`}>
              {/* X-axis */}
              <g transform={`translate(0,${height})`} fill="none" font-size="10" font-family="sans-serif"
                text-anchor="middle">
                <path class="domain" stroke="currentColor" d={`M0,6V0H${divWidth}V6`}></path>
                <For each={getXTicks()}>{(item, index) => (
                  <g class="tick" opacity="1" transform={`translate(${x()(new Date(item))},35)`}>
                    <line stroke="currentColor" transform={`translate(0,-36)`} y2="12"></line>
                    <line stroke="currentColor" transform={`translate(0,-24) rotate(45)`} y2="12"></line>
                    <text fill="currentColor" transform="rotate(-45), translate(-25, -15)">{formatDate(item)}</text>
                  </g>
                )}</For>
              </g>

              {/* Y-axis */}
              <g id={`${id}-y`} fill="none" font-size="10" font-family="sans-serif" text-anchor="end">
                <path class="domain" stroke="currentColor" d={`M-6,${height}H0V0H-6`}></path>
                <For each={y().ticks(10)}>{(value) => (
                  <g class="tick" opacity="1" transform={`translate(0,${y()(value)})`}>
                    <line stroke="currentColor" x2="-6"></line>
                    <text fill="currentColor" x="-9" dy="0.32em">{value.toLocaleString()}</text>
                  </g>
                )}</For>
              </g>
              <text transform="rotate(-90)" y="-75" x="-100" dy="1em" style={{ 'text-anchor': 'middle' }}>VRP</text>

              {/* Grid lines */}
              <g class="grid">
                <For each={y().ticks(10)}>{(tick) => (
                  <line
                    x1="0"
                    x2={divWidth}
                    y1={y()(tick)}
                    y2={y()(tick)}
                    stroke="#e0e0e0"
                    stroke-dasharray="3,3"
                  ></line>
                )}</For>
              </g>

              {/* Data lines */}
              <For each={dataS()}>{(item, index) => (
                <line
                  class="data-line"
                  x1={x()(new Date(item.date))}
                  y1={height}
                  x2={x()(new Date(item.date))}
                  y2={y()(item.close)}
                  stroke="steelblue"
                  stroke-width="0.5"
                />
              )}</For>

              {/* Data Points */}
              <For each={dataS()}>{(item, index) => (
                <circle class="data-point cursor-pointer"
                  cx={x()(new Date(item.date))}
                  cy={y()(item.close)}
                  fill={da[0]() && da[0]()!.index === index() ? 'orange' : 'steelblue'}
                  r={isZooming() ? '2' : (da[0]() && da[0]()!.index === index() ? '5' : '3')}
                  onMouseOver={() => (batch(() => da[1]({ ...item, index: index() })))}
                  onMouseOut={() => (batch(() => da[1](undefined)))}
                ></circle>
              )}</For>
            </g>

          </svg>
        </SvgDrawingComponent>


      </div>
    </div>
  );
}