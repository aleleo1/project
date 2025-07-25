/**
 * SVG Rectangle Drawer TypeScript Module
 * 
 * Usage:
 * import { RectangleDrawer, type RectangleDrawerOptions, type RectangleData } from './rectangle-drawer';
 * 
 * const drawer = new RectangleDrawer(svgElement, options);
 * drawer.enable();
 */

export interface RectangleDrawerOptions {
  strokeColor?: string;
  strokeWidth?: number;
  dashArray?: string;
  height?: number;
  fillColor?: string;
  completedStrokeColor?: string;
  completedFillColor?: string;
  minSize?: number;
  cursor?: string;
  y?: number;
}

export interface RectangleData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RectangleCreatedEvent extends CustomEvent {
  detail: {
    rectangle: SVGRectElement;
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface RectangleRemovedEvent extends CustomEvent {
  detail: {
    rectangle: SVGRectElement;
  };
}

interface MousePosition {
  x: number;
  y: number;
}

export class RectangleDrawer {
  private svg: SVGSVGElement;
  private isDrawing: boolean = false;
  private startX: number = 0;
  private startY: number = 0;
  private rectangle: SVGRectElement | null = null;
  private tempRect: SVGRectElement | null = null;
  private enabled: boolean = false;
  private originalCursor: string = '';
  private options: Required<RectangleDrawerOptions>;

  constructor(svgElement: SVGSVGElement, options: RectangleDrawerOptions = {}) {
    if (!svgElement || svgElement.tagName !== 'svg') {
      throw new Error('First parameter must be an SVG element');
    }

    this.svg = svgElement;

    // Default options with type safety
    this.options = {
      strokeColor: '#007bff',
      strokeWidth: 2,
      dashArray: '8,4',
      fillColor: 'rgba(0, 123, 255, 0.1)',
      completedStrokeColor: '#28a745',
      completedFillColor: 'rgba(40, 167, 69, 0.1)',
      minSize: 5,
      cursor: 'crosshair',
      ...options
    } as Required<RectangleDrawerOptions>;

    // Bind methods to preserve 'this' context
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleContextMenu = this.handleContextMenu.bind(this);
    this.handleSelectStart = this.handleSelectStart.bind(this);

    this.createTempRect();
  }

  /**
   * Create the temporary rectangle for preview
   */
  private createTempRect(): void {
    this.tempRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    this.tempRect.setAttribute('stroke', this.options.strokeColor);
    this.tempRect.setAttribute('stroke-width', this.options.strokeWidth.toString());
    this.tempRect.setAttribute('stroke-dasharray', this.options.dashArray);
    this.tempRect.setAttribute('fill', 'none');
    this.tempRect.setAttribute('height', (this.options.height ?? 0).toString())
    this.tempRect.style.display = 'none';
    this.tempRect.style.pointerEvents = 'none';
    this.svg.appendChild(this.tempRect);
  }

  /**
   * Get mouse position relative to SVG
   */
  private getMousePos(e: MouseEvent): MousePosition {
    const rect = this.svg.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  /**
   * Handle mouse down event
   */
  private handleMouseDown(e: MouseEvent): void {
    if (!this.enabled || !this.tempRect) return;

    const pos = this.getMousePos(e);
    this.isDrawing = true;
    this.startX = pos.x;
    this.startY = this.options.y

    // Show and position the temporary rectangle
    this.tempRect.style.display = 'block';
    this.tempRect.setAttribute('x', this.startX.toString());
    this.tempRect.setAttribute('y', this.startY.toString());
    this.tempRect.setAttribute('width', '0');
    this.tempRect.setAttribute('height', this.options.height.toString());

    // Prevent default to avoid text selection
    e.preventDefault();
  }

  /**
   * Handle mouse move event
   */
  private handleMouseMove(e: MouseEvent): void {
    if (!this.enabled || !this.isDrawing || !this.tempRect) return;

    const pos = this.getMousePos(e);
    const width = pos.x - this.startX;
    const height = this.options.height

    // Handle negative dimensions
    const rectX = width < 0 ? pos.x : this.startX;
    const rectY = this.options.y;
    const rectWidth = Math.abs(width);
    const rectHeight = Math.abs(height);

    this.tempRect.setAttribute('x', rectX.toString());
    this.tempRect.setAttribute('y', rectY.toString());
    this.tempRect.setAttribute('width', rectWidth.toString());
    this.tempRect.setAttribute('height', rectHeight.toString());
  }

  /**
   * Handle mouse up event
   */
  private handleMouseUp(e: MouseEvent): void {
    if (!this.enabled || !this.isDrawing) return;

    const pos = this.getMousePos(e);
    const width = pos.x - this.startX;
    const height = this.options.height;

    // Only create rectangle if it meets minimum size
    if (Math.abs(width) > this.options.minSize && Math.abs(height) > this.options.minSize) {
      const rectX = width < 0 ? pos.x : this.startX;
      const rectY = height < 0 ? pos.y : this.startY;
      const rectWidth = Math.abs(width);
      const rectHeight = Math.abs(height);

      this.createRectangle(rectX, rectY, rectWidth, rectHeight);
    }

    this.finishDrawing();
  }

  /**
   * Handle mouse leave event
   */
  private handleMouseLeave(): void {
    if (this.isDrawing) {
      this.finishDrawing();
    }
  }

  /**
   * Handle context menu event
   */
  private handleContextMenu(e: MouseEvent): void {
    if (this.enabled) {
      e.preventDefault();
    }
  }

  /**
   * Handle select start event
   */
  private handleSelectStart(e: Event): void {
    if (this.enabled && this.isDrawing) {
      e.preventDefault();
    }
  }

  /**
   * Finish drawing and reset state
   */
  private finishDrawing(): void {
    if (this.tempRect) {
      this.tempRect.style.display = 'none';
    }
    this.isDrawing = false;
    this.clear();
  }

  /**
   * Create a permanent rectangle
   */
  private createRectangle(x: number, y: number, width: number, height: number): SVGRectElement {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x.toString());
    rect.setAttribute('y', y.toString());
    rect.setAttribute('width', width.toString());
    rect.setAttribute('height', height.toString());
    rect.setAttribute('stroke', this.options.completedStrokeColor);
    rect.setAttribute('stroke-width', this.options.strokeWidth.toString());
    rect.setAttribute('stroke-dasharray', this.options.dashArray);
    rect.setAttribute('fill', this.options.completedFillColor);

    // Add class for easy identification
    rect.classList.add('drawn-rectangle');

    this.svg.appendChild(rect);
    this.rectangle = rect;

    // Dispatch custom event
    const event = new CustomEvent('rectangleCreated', {
      detail: { rectangle: rect, x, y, width, height }
    }) as RectangleCreatedEvent;

    this.svg.dispatchEvent(event);

    return rect;
  }

  /**
   * Enable drawing functionality
   */
  public enable(): void {
    if (this.enabled) return;

    this.enabled = true;

    // Store original cursor
    this.originalCursor = this.svg.style.cursor;
    this.svg.style.cursor = this.options.cursor;

    // Add event listeners
    this.svg.addEventListener('mousedown', this.handleMouseDown);
    this.svg.addEventListener('mousemove', this.handleMouseMove);
    this.svg.addEventListener('mouseup', this.handleMouseUp);
    this.svg.addEventListener('mouseleave', this.handleMouseLeave);
    this.svg.addEventListener('contextmenu', this.handleContextMenu);
    this.svg.addEventListener('selectstart', this.handleSelectStart);
    document.addEventListener('selectstart', this.handleSelectStart);
  }

  /**
   * Disable drawing functionality
   */
  public disable(): void {
    if (!this.enabled) return;

    this.enabled = false;

    // Restore original cursor
    this.svg.style.cursor = this.originalCursor || '';

    // Remove event listeners
    this.svg.removeEventListener('mousedown', this.handleMouseDown);
    this.svg.removeEventListener('mousemove', this.handleMouseMove);
    this.svg.removeEventListener('mouseup', this.handleMouseUp);
    this.svg.removeEventListener('mouseleave', this.handleMouseLeave);
    this.svg.removeEventListener('contextmenu', this.handleContextMenu);
    this.svg.removeEventListener('selectstart', this.handleSelectStart);
    document.removeEventListener('selectstart', this.handleSelectStart);

    // Cancel any ongoing drawing
    if (this.isDrawing) {
      this.finishDrawing();
    }
  }

  /**
   * Clear all drawn rectangles
   */
  public clear(): void {
    if (this.rectangle) {
      this.rectangle!.remove();
      //this.rectangle = null;
      this.svg.dispatchEvent(new CustomEvent('rectanglesCleared'));
    }


  }

  /**
   * Remove the last drawn rectangle
   */
  public undo(): void {
    if (this.rectangle) {
      this.rectangle.remove();

      const event = new CustomEvent('rectangleRemoved', {
        detail: { rectangle: this.rectangle }
      }) as RectangleRemovedEvent;

      this.svg.dispatchEvent(event);
    }
  }

  /**
   * Get all drawn rectangles
   */
  public getRectangle(): SVGRectElement | null {
    return this.rectangle;
  }

  /**
   * Get rectangle data as objects
   */
  public getRectangleData(): RectangleData | null {
    const rect = this.rectangle;
    if (rect) {
      return {
        x: parseFloat(rect.getAttribute('x') || '0'),
        y: parseFloat(rect.getAttribute('y') || '0'),
        width: parseFloat(rect.getAttribute('width') || '0'),
        height: parseFloat(rect.getAttribute('height') || '0')
      }
    } else { return null }
  };


  /**
   * Update options
   */
  public updateOptions(newOptions: Partial<RectangleDrawerOptions>): void {
    this.options = { ...this.options, ...newOptions };

    // Update temp rect with new options
    if (this.tempRect) {
      this.tempRect.setAttribute('stroke', this.options.strokeColor);
      this.tempRect.setAttribute('stroke-width', this.options.strokeWidth.toString());
      this.tempRect.setAttribute('stroke-dasharray', this.options.dashArray);
    }

    // Update cursor if enabled
    if (this.enabled) {
      this.svg.style.cursor = this.options.cursor;
    }
  }

  /**
   * Check if drawing is currently enabled
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get current options
   */
  public getOptions(): Required<RectangleDrawerOptions> {
    return { ...this.options };
  }

  /**
   * Destroy the drawer and clean up
   */
  public destroy(): void {
    this.disable();

    if (this.tempRect) {
      this.tempRect.remove();
      this.tempRect = null;
    }

    this.clear();
  }
}