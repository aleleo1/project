import { createEffect, Show , For, onMount, type Accessor, createSignal, batch, createMemo} from "solid-js";
import {scaleUtc, max, scaleLinear, utcMonth } from 'd3';
import { useData } from "./dataContext";
import { formatDate, getParams } from "../utils";
import DOMPurify from 'isomorphic-dompurify';
import { useAttention } from "./attentionContext";

export default function Chart_2() {
  // Sample data (replace with your actual data)
  let chartContainer: SVGSVGElement | undefined;
  let container;
  const da = useAttention()!.signals!['dataAttention']
  const [dataS] = useData()!.data!['data']
  const refetch = useData()!.signals!['refetch']
  const margin = { top: 30, right: 50, bottom: 120, left: 100 };
  const height = 350 - margin.top - margin.bottom;
  const [isFullView, setFullView] = useAttention()!.signals!['fullView']
  const {loadNewData, loadNewDataWithScroll} = useData()!.functions

  onMount(() => {

    const parent = container!.parentElement
    console.log(parent.children[0])
    if (Array.from(parent.children).every((c: any) => !['load'].includes(c.id as string))){
    }
  })      

  //ASSE X
  const defaultWidth = 800
  const divWidth = () =>  defaultWidth + (!isFullView() ? 0 : (margin.left + margin.right))
  const xWidth = () => !isFullView()  ? (utcMonth.count( new Date(dataS()!.at(-1)!.date), new Date(dataS()!.at(0)!.date)) + 1) * 100 : defaultWidth
  const fullWidth = () => (!isFullView() ? xWidth() : defaultWidth) + margin.left + margin.right 
  const range = () => [0, xWidth()]
  const x = createMemo(() => scaleUtc([new Date(dataS()![0].date), new Date(dataS()!.at(-1)!.date)], range()))

  //ASSE Y
  const yScale = scaleLinear()
  .nice()
  .range([height, 0]);
  const y = createMemo(() => yScale.domain([0, max(dataS()!, d => d.close)!]))
 
  
  return (
      <div ref={container} style={{ width: `${divWidth()}`, height: '350px', 'overflow-x': 'auto',"overflow-y": 'hidden', "scroll-behavior": "smooth", padding: '10px'}} onscroll={loadNewDataWithScroll}>
        <svg ref={chartContainer} style={{ display: 'block' }} width={fullWidth()} height="350" viewBox={`0 0 ${fullWidth()} 350`}>
          <rect class="invisible-clickable" x={fullWidth() - 200} y="0" width="200" height="350" onClick={() => {console.log('click'); loadNewData()}} />
          <g class="tooltip" >
            <rect class="toolti p-bg" x={fullWidth() - 104} y="0" width="95" height="25"  />
            <text class="tooltip-text" x={fullWidth() - 100} y="16">{refetch.at(2)!() ? 'Load more data' : 'No more data'}</text>
          </g>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X-axis */}
            <g transform={`translate(0,${height})`} fill="none" font-size="10" font-family="sans-serif"
              text-anchor="middle">
              <path class="domain" stroke="currentColor" d={`M0,6V0H${fullWidth()}V6`}></path>
              <For each={x().ticks(utcMonth.every(1)!)}>{(item, index) => (
                <g class="tick" opacity="1" transform={`translate(${x()(new Date(item))},35)`}>
                  <line stroke="currentColor" transform={`translate(0,-36)`} y2="12"></line>
                  <line stroke="currentColor" transform={`translate(0,-24) rotate(45)`} y2="12"></line>
                  <text fill="currentColor"  transform="rotate(-45), translate(-25, -15)">{formatDate(item)}</text>
                </g>
              )}</For>
            </g>
            {/* <text x={width / 2} y={height + 60} style={{ 'text-anchor': 'middle' }}>Date</text> */}
            
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
             fill={da[0]() && da[0]()!.index === index() ? 'orange' : 'steelblue' }
             r={da[0]() && da[0]()!.index === index() ? '5' : '3' }
             onMouseOver={() => (batch(() => da[1]({...item, index: index()})))}
             onMouseOut={() => (batch(() => da[1](undefined)))}
              ></circle>
            )}</For>
          </g>

            {/* ToolTip */}
          <Show when={da[0]()}>
            <g class="tooltip" style="pointer-events: none;">
                  <rect 
                    x={`${x()(new Date(da[0]()!.date))}`} 
                    y={`${y()(da[0]()!.close) - 30}`}  
                    width="120" 
                    height="50" 
                    rx="4" 
                    fill="rgba(0,0,0,0.8)"
                    opacity="1">
                  </rect>
                  <text 
                    x={`${x()(new Date(da[0]()!.date)) + 50}`}  
                    y={`${y()(da[0]()!.close) - 15 }`}  
                    font-size="12px" 
                    fill="white"
                    text-anchor="start"
                    alignment-baseline="middle"
                    >
                      <tspan x={x()(new Date(da[0]()!.date)) + 5} dy="0">
                    {formatDate(da[0]()!.date)} 
                    </tspan>
                    <tspan x={x()(new Date(da[0]()!.date)) + 5} dy="20">
                    {da[0]()!.close ? parseInt(da[0]()!.close) : 0}
                    </tspan>
                  </text>
            </g>
          </Show>
         
        </svg>
        
      </div>
  );
}