import { createEffect, createSignal, Show , For, type Signal, type Accessor, type Setter, useContext} from "solid-js";
import * as d3 from 'd3';
import { createStore } from "solid-js/store";
import { useAttention } from "./context";
interface DataPoint {
  date: Date;
  close: number;
  index?: number;
  path?: string;
}


export default function Chart_2() {
  // Sample data (replace with your actual data)
  let chartContainer: SVGSVGElement | undefined;
  let container;
  const da = useAttention()!.signals['dataAttention']

  const [dataS, setData] = createStore<DataPoint[]>(
    [
    { date: new Date("2020-01-01"), close: 150 },
    { date: new Date("2020-02-01"), close: 170 },
    { date: new Date("2020-03-01"), close: 160 },
    { date: new Date("2020-04-01"), close: 180 },
    { date: new Date("2020-05-01"), close: 210 },
    { date: new Date("2020-06-01"), close: 190 },
    { date: new Date("2020-07-01"), close: 220 },
    { date: new Date("2020-08-01"), close: 230 },
    { date: new Date("2020-09-01"), close: 200 },
    { date: new Date("2020-10-01"), close: 250 },
    { date: new Date("2020-11-01"), close: 270 },
    { date: new Date("2020-12-01"), close: 260 },
    { date: new Date("2021-01-01"), close: 280 },
    { date: new Date("2021-02-01"), close: 300 },
    { date: new Date("2021-03-01"), close: 290 },
    { date: new Date("2021-04-01"), close: 310 },
    { date: new Date("2021-05-01"), close: 320 },
    { date: new Date("2021-06-01"), close: 350 },
    { date: new Date("2021-07-01"), close: 340 },
    { date: new Date("2021-08-01"), close: 360 },
    { date: new Date("2021-09-01"), close: 370 },
    { date: new Date("2021-10-01"), close: 380 },
    { date: new Date("2021-11-01"), close: 400 },
    { date: new Date("2021-12-01"), close: 420 },
    { date: new Date("2022-01-01"), close: 430 },
    { date: new Date("2022-02-01"), close: 450 },
    { date: new Date("2022-03-01"), close: 440 },
    { date: new Date("2022-04-01"), close: 460 },
    { date: new Date("2022-05-01"), close: 480 },
    { date: new Date("2022-06-01"), close: 470 },
    { date: new Date("2022-07-01"), close: 490 },
    { date: new Date("2022-08-01"), close: 510 },
    { date: new Date("2022-09-01"), close: 500 },
    { date: new Date("2022-10-01"), close: 520 },
    { date: new Date("2022-11-01"), close: 540 },
    { date: new Date("2022-12-01"), close: 530 },
    { date: new Date("2023-01-01"), close: 550 },
    { date: new Date("2023-02-01"), close: 570 },
    { date: new Date("2023-03-01"), close: 560 },
    { date: new Date("2023-04-01"), close: 590 },
    { date: new Date("2023-05-01"), close: 600 },
    { date: new Date("2023-06-01"), close: 620 },
    { date: new Date("2023-07-01"), close: 610 },
    { date: new Date("2023-08-01"), close: 630 },
    { date: new Date("2023-09-01"), close: 650 },
    { date: new Date("2023-10-01"), close: 640 },
    { date: new Date("2023-11-01"), close: 670 },
    { date: new Date("2023-12-01"), close: 680 },
    { date: new Date("2024-03-01"), close: 760 },
    { date: new Date("2024-04-01"), close: 790 },
    { date: new Date("2024-05-01"), close: 700 },
    { date: new Date("2024-06-01"), close: 720 },
    { date: new Date("2024-07-01"), close: 710 },
    { date: new Date("2024-08-01"), close: 730 },
    { date: new Date("2024-09-01"), close: 750 },
    { date: new Date("2024-10-01"), close: 740 },
    { date: new Date("2024-11-01"), close: 770 },
    { date: new Date("2024-12-01"), close: 780 },
    { date: new Date("2025-05-01"), close: 800 },
    { date: new Date("2025-06-01"), close: 820 },
    { date: new Date("2025-07-01"), close: 810 },
    { date: new Date("2025-08-01"), close: 830 },
    { date: new Date("2025-09-01"), close: 850 },
    { date: new Date("2025-10-01"), close: 840 },
    { date: new Date("2025-11-01"), close: 870 },
    { date: new Date("2025-12-01"), close: 880 },
    { date: new Date("2026-10-01"), close: 840 },
    { date: new Date("2026-11-01"), close: 870 }
  ]);
  
  // Chart dimensions
  const margin = { top: 30, right: 50, bottom: 100, left: 80 };
  const width = () => dataS.length * 50;
  const height = 350 - margin.top - margin.bottom;

  //ASSE X
  const xScale = () => d3.scaleUtc()
    .range([18, width()]);
  const x = () => xScale().domain(d3.extent(dataS, (d: DataPoint) => d.date!))

  //ASSE Y
  const yScale = d3.scaleLinear()
  .nice()
  .range([height, 0]); // Properly inverted range for SVG coordinates
  const y = () => yScale.domain([0, d3.max(dataS, d => d.close!)! * 1.1])


  function loadNewData(event: any) {
    const el = event.target

    if (el.scrollLeft <= 0) {
        // User scrolled too far left, reset to right
        for(let i = 0; i < 5; i++){
        
        
          const lastDate = new Date(dataS.at(0)!.date);
          // Add one month to the last date
          const newDate = new Date(lastDate);
          newDate.setMonth(newDate.getMonth() - 1);
          
          const d = {
            date: newDate, 
            close: dataS.at(0)!.close + (Math.random() * 30 - 15) // Add some variation
          };
          
          setData((current) => [d, ...current]); // Add to the end, not beginning
        }
        el.scrollLeft  = 20;
    }
  }
  const formatDate = (d: Date) => (d.toISOString().replace('T', ' ').slice(0, 19)) 

  
  // Make sure your scales update when data changes
  createEffect(() => {
    // This will re-run whenever dataS changes
    x().domain(d3.extent(dataS, d => d.date));
    y().domain([0, d3.max(dataS, d => d.close!)! * 1.1]);
  });
 
  
  return (
      <div ref={container} style={{ width: '500px', height: '350px', 'overflow-x': 'auto',"overflow-y": 'hidden', "scroll-behavior": "smooth", padding: '10px'}} onscroll={loadNewData}>
        <svg ref={chartContainer} style={{ display: 'block' }} width={width() + margin.left + margin.right} height="350" viewBox={`0 0 ${width() + margin.left + margin.right} 350`}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* X-axis */}
            <g transform={`translate(0,${height})`} fill="none" font-size="10" font-family="sans-serif"
              text-anchor="middle">
              <path class="domain" stroke="currentColor" d={`M0,6V0H${width()}V6`}></path>
              <For each={dataS}>{(item, index) => (
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
            <For each={dataS}>{(item, index) => (
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
            <For each={dataS}>{(item, index) => (
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