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
    const [drawer, setDrawer] = createSignal<RectangleDrawer | null>(null);
    const { download } = useData()!.constants!
    const { setIsDrawingEnabled } = useChart()!.functions as any;
    const { isDrawingEnabled } = useChart()!.accessors as any;
    const loadDrawer = async (svgElement: SVGSVGElement) => {
        try {
            // Dynamic import - only loads when enableDrawing is true
            const newDrawer = new RectangleDrawer(svgElement, props.drawingOptions);

            // Set up event listeners
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
        props.onRectangleCreated?.({ x, y, width, height });
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
        handleDrawing();
        console.log(isDrawingEnabled())
    }))

    // Cleanup on unmount
    onCleanup(() => {
        const currentDrawer = drawer();
        if (currentDrawer) {
            const svg = svgRef();
            if (svg) {
                svg.removeEventListener('rectangleCreated', handleRectangleCreated);
                svg.removeEventListener('rectanglesCleared', handleRectanglesCleared);
            }
            currentDrawer.destroy();
        }
    });

    // Public methods for parent components
    const clearRectangles = () => {
        drawer()?.clear();
    };

    const undoLastRectangle = () => {
        drawer()?.undo();
    };

    const getRectangleData = (): RectangleData | null => {
        return drawer()?.getRectangleData() ?? null;
    };

    const handleDrawing = () => {
        const currentDrawer = drawer();
        if (currentDrawer) {
            if (isDrawingEnabled()) {
                currentDrawer.enable();
            } else {
                currentDrawer.disable();
            }
        }
    };

    return (
        <div style={{ "z-index": isDrawingEnabled() ? 1000 : 10 }}>
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
