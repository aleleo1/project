import { For, Show, batch, createUniqueId, onMount } from "solid-js";
import { useData } from "../contexts/dataContext";
import { formatDate } from "../utils";
import { useAttention } from "../contexts/attentionContext";
import { useChart } from "../contexts/chartContext";
/* import { zoom, select } from 'd3' */
export default function Chart_2() {
  const id = createUniqueId()
  let chartContainer: SVGSVGElement | undefined;
  let container;
  const { loadNewData, loadNewDataWithScroll, isRt } = useData()!.functions as any
  const da = useAttention()!.signals!['dataAttention']
  const { divWidth, y, containerClass, getXTicks, x, fullWidth } = useChart()!.accessors as any
  const { margin, height } = useChart()!.constants as any
  const refetch = useData()!.signals!['refetch']

  const dataS = useData()!.functions!['dataS']
/*   onMount(() => {
    let zoomOn = zoom()
      .on('zoom', handleZoom);

    function handleZoom(e) {
      select(`${id}`)
        .attr('transform', e.transform);
    }

    function initZoom() {
      select(`${id}`)
        .call(zoomOn);
    }
    initZoom()
  }) */
  return (
    <div class={`p-10 ${containerClass()}`}>
      <div ref={container} style={{ 'width': `${divWidth()}`, height: '350px', 'overflow-x': 'auto', "overflow-y": 'hidden', "scroll-behavior": "smooth", padding: '10px' }} onscroll={loadNewDataWithScroll}>
        <svg id={id} ref={chartContainer} style={{ display: 'block' }} width={fullWidth()} height="350" viewBox={`0 0 ${fullWidth()} 350`}>
          <Show when={!isRt()}>
            <rect class="invisible-clickable" x={fullWidth() - 200} y="0" width="200" height="350" onClick={loadNewData} />
            <g class="tooltip" >
              <rect class="toolti p-bg" x={fullWidth() - 104} y="0" width="95" height="25" />
              <text class="tooltip-text" x={fullWidth() - 100} y="16">{refetch.at(2)!() ? 'Load more data' : 'No more data'}</text>
            </g>
          </Show>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X-axis */}
            <g transform={`translate(0,${height})`} fill="none" font-size="10" font-family="sans-serif"
              text-anchor="middle">
              <path class="domain" stroke="currentColor" d={`M0,6V0H${fullWidth()}V6`}></path>
              <For each={getXTicks()}>{(item, index) => (
                <g class="tick" opacity="1" transform={`translate(${x()(new Date(item))},35)`}>
                  <line stroke="currentColor" transform={`translate(0,-36)`} y2="12"></line>
                  <line stroke="currentColor" transform={`translate(0,-24) rotate(45)`} y2="12"></line>
                  <text fill="currentColor" transform="rotate(-45), translate(-25, -15)">{formatDate(item)}</text>
                </g>
              )}</For>
            </g>

            {/* Y-axis */}
            <g fill="none" font-size="10" font-family="sans-serif" text-anchor="end">
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
                  x2={fullWidth()}
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
                r={da[0]() && da[0]()!.index === index() ? '5' : '3'}
                onMouseOver={() => (batch(() => da[1]({ ...item, index: index() })))}
                onMouseOut={() => (batch(() => da[1](undefined)))}
              ></circle>
            )}</For>
          </g>

        </svg>

      </div>
    </div>
  );
}