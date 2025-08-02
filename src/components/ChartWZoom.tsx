import { type Component, createSignal, createEffect, onCleanup, onMount, Show, on } from 'solid-js';
import { RectangleDrawer, type RectangleDrawerOptions, type RectangleData } from './utils/RectangleDrawer';
import { useData } from '../contexts/dataContext';
import { useChart } from '../contexts/chartContext';

interface SvgDrawingComponentProps {
    enableDrawing?: boolean;
    width?: number;
    height?: number;
    drawingOptions?: RectangleDrawerOptions;
    onRectangleCreated?: (data: RectangleData) => void;
    onRectanglesCleared?: () => void;
    children?: any;
}

const SvgDrawingComponent: Component<SvgDrawingComponentProps> = (props) => {
    const [svgRef, setSvgRef] = createSignal<SVGSVGElement>();
    const { download } = useData()!.constants!
    const { setIsDrawingEnabled, setDrawer } = useChart()!.functions as any;
    const { drawer, boundaries, isDrawingEnabled, buffBounds } = useChart()!.accessors as any;
    const { dataS } = useData()!.functions as any
    const loadDrawer = async (svgElement: SVGSVGElement) => {
        try {
            // Dynamic import - only loads when enableDrawing is true
            const newDrawer = new RectangleDrawer(svgElement, props.drawingOptions);

            // Set up event listeners
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            svgElement.addEventListener('rectangleCreated', handleRectangleCreated);
            svgElement.addEventListener('rectanglesCleared', handleRectanglesCleared);

            return newDrawer;
        } catch (error) {
            console.error('Failed to load RectangleDrawer:', error);
            return null;
        }
    };

    const handleRectangleCreated = (event: CustomEvent) => {
        const { x, y, width, height } = event.detail;
        const index0 = boundaries()[0];
        const index1 = boundaries()[1]

        props.onRectangleCreated?.({ x, y, width, height, index0, index1 });
    };

    const handleRectanglesCleared = () => {
        props.onRectanglesCleared?.();
    };


    // Effect to handle enabling/disabling drawing
    createEffect(async () => {
        const svg = svgRef();
        const shouldEnable = true;

        if (!svg) return;

        if (shouldEnable && !drawer()) {
            // Load and initialize drawer
            const newDrawer = await loadDrawer(svg);
            if (newDrawer) {
                setDrawer(newDrawer);
                newDrawer.enable();
                setIsDrawingEnabled(true);
            }
        } else if (!shouldEnable && drawer()) {
            // Disable and cleanup drawer
            const currentDrawer = drawer();
            if (currentDrawer) {
                currentDrawer.disable();
                setIsDrawingEnabled(false);
            }
        } else if (shouldEnable && drawer()) {
            // Enable existing drawer
            drawer()!.enable();
            setIsDrawingEnabled(true);
        } else if (!shouldEnable && drawer()) {
            // Disable existing drawer
            drawer()!.disable();
            setIsDrawingEnabled(false);
        }
    });

    // Effect to update drawer options when they change
    createEffect(() => {
        const currentDrawer = drawer();
        if (currentDrawer && props.drawingOptions) {
            currentDrawer.updateOptions(props.drawingOptions);
        }
    });

    createEffect(on(isDrawingEnabled, () => {
        if (isDrawingEnabled()) {
            drawer()!.enable();
        } else {
            drawer()!.disable();
        }
    }, { defer: true }))

    // Cleanup on unmount
    onCleanup(() => {
        const currentDrawer = drawer();
        if (currentDrawer) {
            const svg = svgRef();
            if (svg) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                svg.removeEventListener('rectangleCreated', handleRectangleCreated);
                svg.removeEventListener('rectanglesCleared', handleRectanglesCleared);
            }
            currentDrawer.destroy();
        }
    });


    return (
        <div>
            <Show when={!download} fallback={props.children} >

                <div class="controls" style={{
                    display: 'flex',
                    gap: '10px',
                    'margin-bottom': '10px',
                    'align-items': 'center'
                }}>
                    <button
                        onClick={() => setIsDrawingEnabled((prev: any) => !prev)}
                        disabled={!drawer()}
                        style={{
                            padding: '8px 16px',
                            'border-radius': '4px',
                            border: 'none',
                            'background-color': isDrawingEnabled() ? '#dc3545' : '#28a745',
                            color: 'white',
                            cursor: drawer() ? 'pointer' : 'not-allowed',
                            opacity: drawer() ? 1 : 0.6
                        }}
                    >
                        {isDrawingEnabled() ? 'Disable Zoom' : 'Enable Zoom'}
                    </button>
                    <Show when={boundaries()[0] !== -1}>
                        <p>{new Date(dataS()![boundaries()[0]].date).toDateString()}</p>
                    </Show>
                    <Show when={boundaries()[1] !== -1}>
                        {new Date(dataS()![boundaries()[1]].date).toDateString()}
                    </Show>
                    <Show when={buffBounds()[0] !== -1}>
                        <p>{new Date(dataS()![buffBounds()[0]].date).toDateString()}</p>
                    </Show>
                    <Show when={buffBounds()[1] !== -1}>
                        {new Date(dataS()![buffBounds()[1]].date).toDateString()}
                    </Show>
                </div>

                <div
                    style={{
                        'background-color': 'white',
                    }}
                >
                    <svg
                        ref={setSvgRef}
                        width={props.width || 800}
                        height={props.height || 400}
                        style={{
                            display: 'block',
                            'max-width': '100%',
                            height: 'auto'
                        }}
                    >

                        <rect width="100%" height="100%" fill="url(#grid)" />

                        {/* Any existing SVG content passed as children */}
                        {props.children}
                    </svg>
                </div>
            </Show>
        </div>
    );
};

export default SvgDrawingComponent;
