import { For, Show, batch, createMemo, createSignal, createUniqueId, type Resource } from "solid-js";
import { formatDate } from "../utils";
import type { DataPoint, UsePlotVariablesReturnType } from "../interfaces";
import Xaxis from "./Xaxis";
import { scaleUtc, scaleLinear } from 'd3-scale';

interface Rectangle {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    fill: string;
    stroke: string;
    opacity: number;
}

interface DateRange {
    startDate: Date;
    endDate: Date;
    dataPoints: any[];
}


export default function Plot(props: { formData: UsePlotVariablesReturnType, dataS: Resource<DataPoint[]> }) {
    /*  */
    const formData = props.formData;
    let chartContainer: SVGSVGElement | undefined;

    // RECTANGLE DRAWING STATE
    const [isDrawingRect, setIsDrawingRect] = createSignal(false);
    const [drawingMode, setDrawingMode] = createSignal(false);
    const [currentRect, setCurrentRect] = createSignal<Rectangle | null>(null);
    const [startPoint, setStartPoint] = createSignal<{ x: number, y: number } | null>(null);

    // SEPARATED DATE SELECTION AND ZOOM STATE
    const [selectedDateRange, setSelectedDateRange] = createSignal<DateRange | null>(null);
    const [zoomedDateRange, setZoomedDateRange] = createSignal<DateRange | null>(null);

    // MANUAL DATE SELECTION STATE
    const [manualStartDate, setManualStartDate] = createSignal<string>("");
    const [manualEndDate, setManualEndDate] = createSignal<string>("");

    // DRAGGING AND PANNING STATE
    const [isDragging, setIsDragging] = createSignal(true);
    const [dragStart, setDragStart] = createSignal<{ x: number, y: number } | null>(null);
    const [panOffset, setPanOffset] = createSignal(0); // Offset for panning in pixels
    const [viewWindowSize, setViewWindowSize] = createSignal(1); // Fraction of total data (0.1 to 1.0)

    const dataS = props.dataS //useData()!.functions!['dataS'] as >
    /* const refetch = useData()!.signals!['refetch']! as any
    const { loadNewData } = useData()!.functions as any */

    //const { loadNewData } = useData()!.functions as any

    const margin = { top: 40, right: 40, bottom: 40, left: 100 };
    const da = createSignal<DataPoint | undefined>(undefined)


    // STRINGS
    const id = createUniqueId()

    // COMPUTED/MEMOS (createMemo & function computations)
    const containerw = () => formData.width() + margin.left + margin.right
    const containerh = () => formData.height() + margin.top + margin.bottom
    const ploth = () => formData.height() - margin.top - margin.bottom
    const plotw = () => formData.width() - margin.left - margin.right

    // Data to display (prioritize zoomed data if available, otherwise show windowed data)
    const displayData = createMemo(() => {
        if (zoomedDateRange()) {
            return zoomedDateRange()!.dataPoints;
        }

        // Apply panning window to full dataset
        const fullData = dataS()!;
        const totalPoints = fullData.length;
        const windowPoints = Math.max(1, Math.floor(totalPoints * viewWindowSize()));

        // Calculate start index based on pan offset (inverted because we want right = newer dates)
        const maxOffset = Math.max(0, totalPoints - windowPoints);
        const clampedOffset = Math.max(0, Math.min(maxOffset, Math.floor(panOffset())));
        const startIndex = maxOffset - clampedOffset; // Invert the offset
        const endIndex = startIndex + windowPoints;

        return fullData.slice(startIndex, endIndex);
    });

    // Helper computed values
    const isZoomed = createMemo(() => !!zoomedDateRange());
    const hasSelection = createMemo(() => !!selectedDateRange());
    const isPannable = createMemo(() => !isZoomed() && viewWindowSize() < 1);

    // Slider values for UI
    const sliderPosition = createMemo(() => {
        if (isZoomed()) return 0;
        const totalPoints = dataS()!.length;
        const maxOffset = Math.max(0, totalPoints - Math.floor(totalPoints * viewWindowSize()));
        return maxOffset > 0 ? panOffset() / maxOffset : 0;
    });

    const sliderMax = createMemo(() => {
        const totalPoints = dataS()!.length;
        return Math.max(0, totalPoints - Math.floor(totalPoints * viewWindowSize()));
    });

    // Date limits for manual selection (based on actual data)
    const actualFirstDate = createMemo(() => new Date(dataS()![0].date));
    const actualLastDate = createMemo(() => new Date(dataS()!.at(-1)!.date));
    const minDateString = createMemo(() => actualFirstDate().toISOString().split('T')[0]);
    const maxDateString = createMemo(() => actualLastDate().toISOString().split('T')[0]);

    const getFirstDate = createMemo(() =>
        new Date(displayData()[0].date)
    );
    const getLastDate = createMemo(() =>
        new Date(displayData().at(-1)!.date)
    );
    const x = createMemo(() => scaleUtc([getFirstDate(), getLastDate()], [margin.left, plotw()]));
    const getXTicks = createMemo(() => x().ticks(formData.tickCount()));

    //ASSE Y - Update to use displayData for proper Y scale
    const y = createMemo(() => scaleLinear()
        .range([ploth(), margin.top]).domain([0, Math.max(...(viewWindowSize() === 1 ? displayData() : dataS()!).map(d => d.close)) ?? 1]))

    // RECTANGLE DRAWING FUNCTIONS
    const getMousePosition = (e: MouseEvent): { x: number, y: number } => {
        const rect = chartContainer!.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    };

    const startDrawingRect = (e: MouseEvent) => {
        // Handle dragging for panning (when not in drawing mode and pannable)
        if (!drawingMode() && isPannable() && e.button === 0) {
            e.preventDefault();
            e.stopPropagation();

            const pos = getMousePosition(e);
            if (pos.x >= margin.left && pos.x <= plotw() + margin.left &&
                pos.y >= margin.top && pos.y <= ploth() + margin.top) {
                setIsDragging(true);
                setDragStart(pos);
                return;
            }
        }

        // Original rectangle drawing logic
        if (!drawingMode()) return;

        e.preventDefault();
        e.stopPropagation();

        const pos = getMousePosition(e);
        // Only allow drawing within the plot area
        if (pos.x < margin.left || pos.x > plotw() + margin.left ||
            pos.y < margin.top || pos.y > ploth() + margin.top) return;

        setIsDrawingRect(true);
        setStartPoint(pos);

        const newRect: Rectangle = {
            id: createUniqueId(),
            x: pos.x,
            y: pos.y,
            width: 0,
            height: 0,
            fill: "rgba(255, 0, 0, 0.2)",
            stroke: "red",
            opacity: 0.7
        };

        setCurrentRect(newRect);
    };

    const updateDrawingRect = (e: MouseEvent) => {
        // Handle dragging for panning
        if (isDragging() && dragStart() && !drawingMode()) {
            const pos = getMousePosition(e);
            const start = dragStart()!;
            const deltaX = pos.x - start.x;

            // Convert pixel movement to data offset (invert direction for natural feel)
            const sensitivity = 2; // Adjust sensitivity
            const dataOffset = -deltaX * sensitivity;

            const newOffset = Math.max(0, Math.min(sliderMax(), panOffset() + dataOffset));
            setPanOffset(newOffset);
            setDragStart(pos); // Update drag start for continuous dragging
            return;
        }

        // Original rectangle drawing logic
        if (!isDrawingRect() || !startPoint() || !currentRect()) return;

        const pos = getMousePosition(e);
        const start = startPoint()!;
        const current = currentRect()!;

        // Calculate rectangle bounds
        const x = Math.min(start.x, pos.x);
        const y = Math.min(start.y, pos.y);
        const width = Math.abs(pos.x - start.x);
        const height = Math.abs(pos.y - start.y);

        // Keep within plot bounds
        const clampedX = Math.max(margin.left, Math.min(x, plotw() + margin.left));
        const clampedY = Math.max(margin.top, Math.min(y, ploth() + margin.top));
        const clampedWidth = Math.min(width, plotw() + margin.left - clampedX);
        const clampedHeight = Math.min(height, ploth() + margin.top - clampedY);

        setCurrentRect({
            ...current,
            x: clampedX,
            y: clampedY,
            width: clampedWidth,
            height: clampedHeight
        });
    };

    const finishDrawingRect = () => {
        // Handle end of dragging
        if (isDragging()) {
            setIsDragging(false);
            setDragStart(null);
            return;
        }

        // Original rectangle drawing logic
        if (!isDrawingRect() || !currentRect()) return;

        const rect = currentRect()!;
        if (rect.width > 5 && rect.height > 5) { // Only process if rectangle is big enough
            // Convert rectangle coordinates to date range
            const leftX = rect.x;
            const rightX = rect.x + rect.width;

            // Convert x coordinates back to dates using the scale
            const xScale = x();
            const leftDate = xScale.invert(leftX);
            const rightDate = xScale.invert(rightX);

            // Ensure proper date ordering (left should be later date due to reversed scale)
            const startDate = rightDate < leftDate ? rightDate : leftDate;
            const endDate = rightDate < leftDate ? leftDate : rightDate;

            // Find data points within the date range from the full dataset
            const dataInRange = dataS()!.filter(item => {
                const itemDate = new Date(item.date);
                return itemDate >= startDate && itemDate <= endDate;
            });

            // Create date range object
            const dateRange: DateRange = {
                startDate,
                endDate,
                dataPoints: dataInRange
            };

            setSelectedDateRange(dateRange);
        }

        // Always clear the rectangle after drawing
        setIsDrawingRect(false);
        setCurrentRect(null);
        setStartPoint(null);
    };

    // SEPARATED DATE SELECTION FUNCTIONS
    const clearDateSelection = () => {
        setSelectedDateRange(null);
        setZoomedDateRange(null)
    };

    // MANUAL DATE SELECTION FUNCTIONS
    const createManualDateRange = () => {
        if (!manualStartDate() || !manualEndDate()) return;

        const startDate = new Date(manualStartDate());
        const endDate = new Date(manualEndDate());

        // Ensure start date is before end date
        if (startDate > endDate) return;

        // Find data points within the date range
        const dataInRange = dataS()!.filter((item, index) => {
            const itemDate = new Date(item.date);
            return itemDate >= startDate && itemDate <= endDate;
        });

        if (dataInRange.length === 0) return;

        const dateRange: DateRange = {
            startDate,
            endDate,
            dataPoints: dataInRange
        };

        setSelectedDateRange(dateRange);
    };

    const clearManualDates = () => {
        setManualStartDate("");
        setManualEndDate("");
    };

    // SEPARATED ZOOM FUNCTIONS
    const zoomToSelection = () => {
        if (selectedDateRange()) {
            setZoomedDateRange(selectedDateRange()!);
        }
    };

    const resetZoom = () => {
        setZoomedDateRange(null);
        setPanOffset(0); // Reset pan when exiting zoom
    };

    // PAN AND ZOOM FUNCTIONS
    const handleWheel = (e: WheelEvent) => {
        if (isZoomed()) return; // Don't handle wheel when zoomed

        e.preventDefault();

        if (e.ctrlKey || e.metaKey) {
            // Zoom with Ctrl/Cmd + wheel
            const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
            const newWindowSize = Math.max(0.05, Math.min(1, viewWindowSize() * zoomFactor));
            setViewWindowSize(newWindowSize);

            // Adjust pan offset to keep roughly the same center
            const totalPoints = dataS()!.length;
            const oldWindowPoints = Math.floor(totalPoints * viewWindowSize());
            const newWindowPoints = Math.floor(totalPoints * newWindowSize);
            const windowDiff = oldWindowPoints - newWindowPoints;

            if (windowDiff > 0) {
                const newMaxOffset = Math.max(0, totalPoints - newWindowPoints);
                const adjustedOffset = Math.min(newMaxOffset, panOffset() + windowDiff / 2);
                setPanOffset(adjustedOffset);
            }
        } else {
            // Pan with regular wheel
            const panSpeed = Math.max(1, Math.floor(dataS()!.length * 0.05));
            const delta = e.deltaY > 0 ? panSpeed : -panSpeed;
            const newOffset = Math.max(0, Math.min(sliderMax(), panOffset() + delta));
            setPanOffset(newOffset);
        }
    };

    const handleSliderChange = (value: number) => {
        setPanOffset(value);
    };

    // DRAWING MODE FUNCTIONS
    const toggleDrawingMode = () => {
        setDrawingMode(!drawingMode());
        if (!drawingMode()) {
            // Cancel any current drawing
            setIsDrawingRect(false);
            setCurrentRect(null);
            setStartPoint(null);
        }
    };

    // COMBINED ACTIONS (for convenience)
    const clearAll = () => {
        clearDateSelection();
        resetZoom();
        clearManualDates();
        setPanOffset(0);
        setViewWindowSize(1);
    };

    return (
        <div>


            {/* Date Selection Controls */}
            <div style={{
                padding: "10px",
                "margin-bottom": "10px",
                "background-color": "#f0f9ff",
                "border-radius": "5px",
                display: "flex",
                gap: "10px",
                "align-items": "center",
                "flex-wrap": "wrap",
                "border-left": "4px solid #0ea5e9"
            }}>
                <strong style={{ color: "#0c4a6e" }}>Date Selection:</strong>

                {/* Drawing Method */}
                <div style={{ display: "flex", gap: "5px", "align-items": "center" }}>
                    <button
                        onClick={toggleDrawingMode}
                        style={{
                            padding: "6px 12px",
                            "background-color": drawingMode() ? "#ef4444" : "#3b82f6",
                            color: "white",
                            border: "none",
                            "border-radius": "4px",
                            cursor: "pointer",
                            "font-size": "12px"
                        }}
                    >
                        {drawingMode() ? "Exit Draw" : "Draw Select"}
                    </button>
                </div>

                {/* Manual Method */}
                <div style={{ display: "flex", gap: "5px", "align-items": "center", "flex-wrap": "wrap", "font-size": "12px" }}>
                    <span style={{ color: "#64748b" }}>Manual:</span>
                    <input
                        type="date"
                        value={manualStartDate()}
                        min={minDateString()}
                        max={maxDateString()}
                        onChange={(e) => setManualStartDate(e.currentTarget.value)}
                        style={{
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            "border-radius": "4px",
                            cursor: "pointer"
                        }}
                    />
                    <span style={{ color: "#64748b" }}>to</span>
                    <input
                        type="date"
                        value={manualEndDate()}
                        min={minDateString()}
                        max={maxDateString()}
                        onChange={(e) => setManualEndDate(e.currentTarget.value)}
                        style={{
                            padding: "4px 8px",
                            border: "1px solid #d1d5db",
                            "border-radius": "4px",
                            cursor: "pointer"
                        }}
                    />
                    <button
                        onClick={createManualDateRange}
                        disabled={!manualStartDate() || !manualEndDate()}
                        style={{
                            padding: "4px 8px",
                            "background-color": (!manualStartDate() || !manualEndDate()) ? "#d1d5db" : "#059669",
                            color: "white",
                            border: "none",
                            "border-radius": "4px",
                            cursor: (!manualStartDate() || !manualEndDate()) ? "not-allowed" : "pointer",
                        }}
                    >
                        Select
                    </button>
                    <Show when={manualStartDate() || manualEndDate()}>
                        <button
                            onClick={clearManualDates}
                            style={{
                                padding: "4px 8px",
                                "background-color": "#6b7280",
                                color: "white",
                                border: "none",
                                "border-radius": "4px",
                                cursor: "pointer",
                            }}
                        >
                            Clear
                        </button>
                    </Show>
                </div>

                {/* Common Actions */}
                <Show when={hasSelection()}>
                    <button
                        onClick={clearDateSelection}
                        style={{
                            padding: "6px 12px",
                            "background-color": "#6b7280",
                            color: "white",
                            border: "none",
                            "border-radius": "4px",
                            cursor: "pointer",
                            "font-size": "12px"
                        }}
                    >
                        Clear Selection
                    </button>
                </Show>

                <span style={{ "font-size": "12px", color: "#64748b" }}>
                    {drawingMode()
                        ? "Click and drag to select dates"
                        : hasSelection()
                            ? `Selected: ${selectedDateRange()!.dataPoints.length} points`
                            : `Available: ${actualFirstDate().toLocaleDateString()} - ${actualLastDate().toLocaleDateString()}`
                    }
                </span>

                <span style={{ "font-size": "12px", color: "#64748b" }}>
                    Elemento selezionato: {da[0]() && da[0]()!.date.toLocaleDateString() + ' --- ' + da[0]()!.close}
                </span>
            </div>

            <Show when={hasSelection()}>

                <div style={{
                    padding: "10px",
                    "margin-bottom": "10px",
                    "background-color": "#f0fdf4",
                    "border-radius": "5px",
                    display: "flex",
                    gap: "10px",
                    "align-items": "center",
                    "flex-wrap": "wrap",
                    "border-left": "4px solid #22c55e"
                }}>
                    <strong style={{ color: "#15803d" }}>Zoom:</strong>

                    <button
                        onClick={zoomToSelection}
                        style={{
                            padding: "6px 12px",
                            "background-color": "#059669",
                            color: "white",
                            border: "none",
                            "border-radius": "4px",
                            cursor: "pointer",
                            "font-size": "12px"
                        }}
                    >
                        Zoom to Selection
                    </button>


                    <Show when={isZoomed()}>
                        <button
                            onClick={resetZoom}
                            style={{
                                padding: "6px 12px",
                                "background-color": "#dc2626",
                                color: "white",
                                border: "none",
                                "border-radius": "4px",
                                cursor: "pointer",
                                "font-size": "12px"
                            }}
                        >
                            Reset Zoom
                        </button>
                    </Show>

                    <Show when={hasSelection() || isZoomed()}>
                        <button
                            onClick={clearAll}
                            style={{
                                padding: "6px 12px",
                                "background-color": "#94a3b8",
                                color: "white",
                                border: "none",
                                "border-radius": "4px",
                                cursor: "pointer",
                                "font-size": "12px"
                            }}
                        >
                            Clear All
                        </button>
                    </Show>

                    <span style={{ "font-size": "12px", color: "#64748b" }}>
                        {isZoomed()
                            ? `🔍 Viewing ${zoomedDateRange()!.dataPoints.length} points`
                            : "📊 Full view"
                        }
                    </span>
                </div>
            </Show>


            {/* Selected Date Range Display */}
            <Show when={hasSelection()}>
                <div style={{
                    padding: "15px",
                    "margin-bottom": "10px",
                    "background-color": "#e0f2fe",
                    "border-radius": "5px",
                    "border-left": "4px solid #0284c7"
                }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#0c4a6e" }}>Selected Date Range</h4>
                    <div style={{ display: "flex", gap: "20px", "flex-wrap": "wrap", "align-items": "center" }}>
                        <div>
                            <strong>From:</strong> {selectedDateRange()!.startDate.toLocaleDateString()}
                        </div>
                        <div>
                            <strong>To:</strong> {selectedDateRange()!.endDate.toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Data Points:</strong> {selectedDateRange()!.dataPoints.length}
                        </div>
                        <div style={{
                            "font-size": "12px",
                            color: "#6b7280",
                            "font-weight": "normal"
                        }}>
                            {/* Show relationship between selection and zoom */}
                            {isZoomed() && zoomedDateRange() === selectedDateRange() ? "🔗 This selection is zoomed" : ""}
                        </div>
                    </div>
                    <Show when={selectedDateRange()!.dataPoints.length > 0}>
                        <details style={{ "margin-top": "10px" }}>
                            <summary style={{ cursor: "pointer", color: "#0284c7" }}>View Data Points</summary>
                            <div style={{ "margin-top": "10px", "max-height": "200px", "overflow-y": "auto" }}>
                                <For each={selectedDateRange()!.dataPoints}>
                                    {(point, index) => (
                                        <div style={{
                                            padding: "5px 0",
                                            "border-bottom": index() < selectedDateRange()!.dataPoints.length - 1 ? "1px solid #e0e7ff" : "none",
                                            "font-size": "14px"
                                        }}>
                                            <strong>{new Date(point.date).toLocaleDateString()}:</strong> {point.close.toLocaleString()}
                                        </div>
                                    )}
                                </For>
                            </div>
                        </details>
                    </Show>
                </div>
            </Show>

            {/* Zoomed Date Range Display (only if different from selection) */}
            <Show when={isZoomed() && zoomedDateRange() !== selectedDateRange()}>
                <div style={{
                    padding: "15px",
                    "margin-bottom": "10px",
                    "background-color": "#f0fdf4",
                    "border-radius": "5px",
                    "border-left": "4px solid #22c55e"
                }}>
                    <h4 style={{ margin: "0 0 10px 0", color: "#15803d" }}>🔍 Zoomed View</h4>
                    <div style={{ display: "flex", gap: "20px", "flex-wrap": "wrap", "align-items": "center" }}>
                        <div>
                            <strong>From:</strong> {zoomedDateRange()!.startDate.toLocaleDateString()}
                        </div>
                        <div>
                            <strong>To:</strong> {zoomedDateRange()!.endDate.toLocaleDateString()}
                        </div>
                        <div>
                            <strong>Showing:</strong> {zoomedDateRange()!.dataPoints.length} points
                        </div>
                    </div>
                </div>
            </Show>

            {/* Pan and Zoom Controls */}
            <Show when={!isZoomed()}>
                <div style={{
                    padding: "10px",
                    "margin-bottom": "10px",
                    "background-color": "#fef3c7",
                    "border-radius": "5px",
                    display: "flex",
                    gap: "10px",
                    "align-items": "flex-start",
                    "flex-wrap": "wrap",
                    "border-left": "4px solid #f59e0b",
                    "flex-direction": "column"
                }}>
                    <strong style={{ color: "#92400e" }}>Pan & Zoom:</strong>

                    <div style={{ display: "flex", gap: "10px", "align-items": "center", "flex-grow": "1", width: "80%" }}>
                        <span style={{ "font-size": "12px", color: "#92400e", "white-space": "nowrap" }}>View:</span>
                        <input
                            type="range"
                            min="0.05"
                            max="1"
                            step="0.01"
                            value={viewWindowSize()}
                            onInput={(e) => setViewWindowSize(parseFloat(e.currentTarget.value))}
                            style={{ "flex-grow": "1" }}
                        />
                        <span style={{ "font-size": "12px", color: "#92400e", "min-width": "30px" }}>
                            {Math.round(viewWindowSize() * 100)}%
                        </span>
                    </div>

                    <Show when={isPannable()}>
                        <div style={{ display: "flex", gap: "10px", "align-items": "center", "flex-grow": "1", width: "80%" }}>
                            <span style={{ "font-size": "12px", color: "#92400e", "white-space": "nowrap" }}>Pan:</span>
                            <input
                                type="range"
                                min="0"
                                max={sliderMax()}
                                step="1"
                                value={panOffset()}
                                onInput={(e) => handleSliderChange(parseInt(e.currentTarget.value))}
                                style={{ "flex-grow": "1" }}
                            />
                            <span style={{ "font-size": "12px", color: "#92400e", "min-width": "40px" }}>
                                {Math.round(sliderPosition() * 100)}%
                            </span>
                        </div>
                    </Show>

                    <div style={{ "font-size": "11px", color: "#92400e", "font-style": "italic" }}>
                        {isPannable()
                            ? "Drag chart or use mouse wheel to pan • Ctrl+wheel to zoom"
                            : "Ctrl+wheel to zoom • Drag when zoomed in"
                        }
                    </div>
                </div>
            </Show>

            <svg
                id={id}
                ref={chartContainer}
                style={{
                    display: 'block',
                    "z-index": "50",
                    cursor: drawingMode()
                        ? "crosshair"
                        : isPannable() && !isZoomed()
                            ? "grab"
                            : "default"
                }}
                width={containerw()}
                height={containerh()}
                viewBox={`0 0 ${containerw()} ${containerh()}`}
                onMouseDown={startDrawingRect}
                onMouseMove={updateDrawingRect}
                onMouseUp={finishDrawingRect}
                onMouseLeave={finishDrawingRect}
                onWheel={handleWheel}
            >
                {/* <g onClick={loadNewData}>
                    <rect fill="#333"
                        rx="4" ry="4"
                        style={{ cursor: "pointer" }} x={plotw() + margin.right + margin.left - 4} y={0} width="95" height="25" />
                    <text style={{
                        fill: "white",
                        "font-size": "12px",
                        "font-family": "sans-serif"
                    }} x={plotw() + margin.right + margin.left} y={16}>{refetch.at(2)!() ? 'Load more data' : 'No more data'}</text>
                </g> */}

                {/* X-axis */}
                <Xaxis formData={formData}>
                    <For each={getXTicks()}>{(item, index) => (
                        <g style={{ opacity: "1" }} id={`${index()}-${id}-xticks`} transform={`translate(${x()(new Date(item)) - margin.left},35)`}>
                            <line stroke="currentColor" transform="translate(0,-36)" y2="12"></line>
                            <line stroke="currentColor" transform="translate(0,-24) rotate(45)" y2="12"></line>
                            <text fill="currentColor" transform="rotate(-45), translate(-25, -15)">{formatDate(item)}</text>
                        </g>
                    )}</For>
                </Xaxis>

                {/* Y-axis */}
                <g id={`${id}-y`}
                    fill="none"
                    transform={`translate(${margin.left}, 0)`}
                    style={{
                        "font-size": "10px",
                        "font-family": "sans-serif",
                        "text-anchor": "end"
                    }}>

                    {/* y-axis line */}
                    <path stroke="currentColor" d={`M0,0V${ploth()}`}></path>

                    {/* ticks */}
                    <For each={y().ticks(10)}>
                        {(value) => (
                            <g>
                                <g style={{ opacity: "1" }} transform={`translate(0,${y()(value)})`}>
                                    <line stroke="currentColor" x2="-6"></line>
                                    <text fill="currentColor" x="-9" dy="0.32em">
                                        {value.toLocaleString()}
                                    </text>
                                </g>
                                <line
                                    x1={margin.left}
                                    x2={plotw() + margin.left}
                                    y1={y()(value)}
                                    y2={y()(value)}
                                    stroke="#e0e0e0"
                                    stroke-dasharray="3,3"
                                ></line>
                            </g>
                        )}
                    </For>

                    {/* axis label */}
                    <text
                        transform={`rotate(-90)`}
                        x={-ploth() / 2}
                        y={-margin.right}
                        style={{
                            "text-anchor": "middle"
                        }}
                        fill="currentColor"
                    >
                        VRP
                    </text>
                </g>

                {/* Data lines */}
                <For each={displayData()}>{(item, index) => (
                    <g>
                        <Show when={formData.plotType() === 'discrete' && x()(new Date(item.date)) > 0}>
                            <line
                                x1={x()(new Date(item.date))}
                                y1={ploth()}
                                x2={x()(new Date(item.date))}
                                y2={y()(item.close)}
                                stroke="steelblue"
                                stroke-width="0.5"
                            />
                        </Show>
                        <Show when={formData.plotType() === 'continous' && x()(new Date(item.date)) > 0}>
                            <line
                                x1={x()(new Date((displayData()[(index() + 1)] ?? item).date))}
                                y1={y()((displayData()[index() + 1] ?? item).close)}
                                x2={x()(new Date(item.date))}
                                y2={y()(item.close)}
                                stroke="steelblue"
                                stroke-width="0.5"
                            />
                        </Show>
                        <circle
                            style={{ cursor: "pointer" }}
                            cx={x()(new Date(item.date))}
                            cy={y()(item.close)}
                            fill={da[0]() && da[0]()!.idx === item.idx ? 'orange' : 'steelblue'}
                            r={da[0]() && da[0]()!.idx === item.idx ? '6' : '3'}
                            onMouseOver={() => !drawingMode() && batch(() => da[1](item))}
                        ></circle>
                    </g>
                )}</For>

                {/* Current drawing rectangle */}
                <Show when={currentRect()}>
                    <rect
                        x={currentRect()!.x}
                        y={currentRect()!.y}
                        width={currentRect()!.width}
                        height={currentRect()!.height}
                        fill={currentRect()!.fill}
                        stroke={currentRect()!.stroke}
                        stroke-width="2"
                        stroke-dasharray="5,5"
                        opacity={currentRect()!.opacity}
                    />
                </Show>

                {/* Existing control buttons */}
                <g transform={`translate(0, ${ploth() + margin.bottom})`}>
                    <g transform="translate(0, 50)">
                        <rect x="0" y="0" width="40" height="30" fill="#e5e7eb" stroke="#d1d5db" rx="4" onClick={formData.decrementWidth} style={{ cursor: "pointer" }} />
                        <text x="20" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "16px",
                            cursor: "pointer"
                        }} onClick={formData.decrementWidth}>◀</text>

                        <rect x="40" y="0" width="80" height="30" fill="#f3f4f6" stroke="#d1d5db" rx="4" />
                        <text x="80" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "12px"
                        }}>w: {formData.width()}</text>

                        <rect x="120" y="0" width="40" height="30" fill="#e5e7eb" stroke="#d1d5db" rx="4" onClick={formData.incrementWidth} style={{ cursor: "pointer" }} />
                        <text x="140" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "16px",
                            cursor: "pointer"
                        }} onClick={formData.incrementWidth}>▶</text>
                    </g>

                    <g transform="translate(200, 50)">
                        <rect x="0" y="0" width="40" height="30" fill="#e5e7eb" stroke="#d1d5db" rx="4" onClick={formData.decrementHeight} style={{ cursor: "pointer" }} />
                        <text x="20" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "16px",
                            cursor: "pointer"
                        }} onClick={formData.decrementHeight}>▲</text>

                        <rect x="40" y="0" width="80" height="30" fill="#f3f4f6" stroke="#d1d5db" rx="4" />
                        <text x="80" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "12px"
                        }}>h: {formData.height()}</text>

                        <rect x="120" y="0" width="40" height="30" fill="#e5e7eb" stroke="#d1d5db" rx="4" onClick={formData.incrementHeight} style={{ cursor: "pointer" }} />
                        <text x="140" y="20" style={{
                            "text-anchor": "middle",
                            "font-family": "Arial",
                            "font-size": "16px",
                            cursor: "pointer"
                        }} onClick={formData.incrementHeight}>▼</text>
                    </g>
                </g>
            </svg>
            <label for="mode">Mode:</label>
            <select
                id="mode"
                name="mode"
                value={formData.plotType()}
                onInput={(e) => formData.setPt(e.currentTarget.selectedIndex)}
                style={{
                    width: "220px",
                    padding: "10px 14px",
                    border: "1px solid #ccc",
                    "border-radius": "8px",
                    "background-color": "white",
                    "font-size": "14px",
                    color: "#333",
                    "box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
                    cursor: "pointer"
                }}
            >
                <For each={formData.plotTypes}>
                    {(item) => <option style={{ cursor: "pointer" }} value={item}>{item}</option>}
                </For>
            </select>
        </div >
    );
}