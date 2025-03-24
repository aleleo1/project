import { createEffect, createSignal, Show , For, type Signal, type Accessor, type Setter, useContext, type Resource} from "solid-js";
import * as d3 from 'd3';
import { createStore } from "solid-js/store";
import { useData } from "./context";
interface DataPoint {
  date: Date;
  close: number;
  index?: number;
  path?: string;
}


export default function Chart_2(p: any) {
  // Sample data (replace with your actual data)
  let chartContainer: SVGSVGElement | undefined;
  let container;
  const da = useData()!.signals['dataAttention']
  const [dataS, {mutate}] = useData()!.data['data']
  /* const [dataS, setData] = createStore<DataPoint[]>(
  data[0]()!
  ); */
  
  // Chart dimensions
  const margin = { top: 30, right: 50, bottom: 100, left: 80 };
  const width = () => dataS()!.length * 50;
  const height = 350 - margin.top - margin.bottom;

  //ASSE X
  const xScale = () => d3.scaleUtc()
    .range([18, width()]);
  const x = () => xScale().domain(d3.extent(dataS()!, (d: DataPoint) => d.date!) as Date[])

  //ASSE Y
  const yScale = d3.scaleLinear()
  .nice()
  .range([height, 0]); // Properly inverted range for SVG coordinates
  const y = () => yScale.domain([0, d3.max(dataS()!, d => d.close!)! * 1.1])


  function loadNewData(event: any) {
    const el = event.target

    if (el.scrollLeft <= 0) {
        // User scrolled too far left, reset to right
        for(let i = 0; i < 5; i++){
        
        
          const lastDate = new Date(dataS()!.at(0)!.date);
          // Add one month to the last date
          const newDate = new Date(lastDate);
          newDate.setMonth(newDate.getMonth() - 1);
          
          const d = {
            date: newDate, 
            close: dataS()!.at(0)!.close + (Math.random() * 30 - 15) // Add some variation
          };
          
          mutate((current) => [d, ...current!]); // Add to the end, not beginning
        }
        el.scrollLeft  = 20;
    }
  }
  const formatDate = (d: Date) => (d.toISOString().replace('T', ' ').slice(0, 19)) 

  
  // Make sure your scales update when data changes
  createEffect(() => {
    // This will re-run whenever dataS changes
    x().domain(d3.extent(dataS()!, d => d.date) as Date[]);
    y().domain([0, d3.max(dataS()!, d => d.close!)! * 1.1]);
  });
 
  
  return (
      <div ref={container} style={{ width: '500px', height: '350px', 'overflow-x': 'auto',"overflow-y": 'hidden', "scroll-behavior": "smooth", padding: '10px'}} onscroll={loadNewData}>
        <svg ref={chartContainer} style={{ display: 'block' }} width={width() + margin.left + margin.right} height="350" viewBox={`0 0 ${width() + margin.left + margin.right} 350`}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X-axis */}
            <g transform={`translate(0,${height})`} fill="none" font-size="10" font-family="sans-serif"
              text-anchor="middle">
              <path class="domain" stroke="currentColor" d={`M0,6V0H${width()}V6`}></path>
              <For each={dataS()}>{(item, index) => (
                <g class="tick" opacity="1" transform={`translate(${x()(item.date) - 36},35)`}>
                  <line stroke="currentColor" transform={`translate(36,-36)`} y2="6"></line>
                  <text fill="currentColor" y="9" dy=".15em"  dx="-.8em"
                    transform="rotate(-45)">{formatDate(item.date)}</text>
                </g>
              )}</For>
            </g>
            {/* <text x={width() / 2} y={height + 60} style={{ 'text-anchor': 'middle' }}>Date</text> */}
            
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
            {/* <text transform="rotate(-90)" y="-35" x={-height / 2} dy="1em" style={{ 'text-anchor': 'middle' }}>Price ($)</text> */}
            
            {/* Grid lines */}
            <g class="grid">
              <For each={y().ticks(10)}>{(tick) => (
                <line 
                  x1="0" 
                  x2={width()} 
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
                x1={x()(item.date)}
                y1={height}
                x2={x()(item.date)}
                y2={y()(item.close)}
                stroke="steelblue"
                stroke-width="1"
              />
            )}</For>

            {/* Data Points */}
            <For each={dataS()}>{(item, index) => (
             <circle class="data-point cursor-pointer" 
             cx={x()(item.date)} 
             cy={y()(item.close)} 
             fill={da[0]() && da[0]()!.index === index() ? 'orange' : 'steelblue' }
             r={da[0]() && da[0]()!.index === index() ? '7' : '4' }
             onMouseOver={() => (da[1]({...item, index: index()}))}
             onMouseOut={() => (da[1](undefined))}
              ></circle>
            )}</For>
          </g>

            {/* ToolTip */}
          <Show when={da[0]()}>
            <g class="tooltip" style="pointer-events: none;">
                  <rect 
                    x={`${x()(da[0]()!.date)}`} 
                    y={`${y()(da[0]()!.close) - 30}`}  
                    width="120" 
                    height="30" 
                    rx="4" 
                    fill="rgba(0,0,0,0.8)">
                  </rect>
                  <text 
                    x={`${x()(da[0]()!.date) + 5}`}  
                    y={`${y()(da[0]()!.close) - 15}`}  
                    font-size="12px" 
                    fill="white"
                    text-anchor="start"
                    alignment-baseline="middle">
                    {formatDate(da[0]()!.date)}
                  </text>
            </g>
          </Show>
        </svg>
        
      </div>
  );
}