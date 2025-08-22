SolidJS Interactive Plot

An interactive data visualization component for SolidJS with features like zooming, panning, date selection, and real-time data updates.
Features

    Interactive Zooming & Panning: Navigate through large datasets with ease
    Date Range Selection: Select data ranges using drawing tools or manual date inputs
    Multiple Plot Types: Support for discrete and continuous plot visualization
    Responsive Design: Adjustable dimensions and responsive layout
    Real-time Updates: Support for loading more data dynamically
    TypeScript Support: Fully typed with comprehensive type definitions
    Customizable: Extensive callback system for integration with your app

Installation
bash

npm install solidjs-interactive-plot

Peer Dependencies

This package requires the following peer dependencies:
bash

npm install solid-js d3

Basic Usage
tsx

import { InteractivePlot, createDefaultFormData, generateSampleData } from 'solidjs-interactive-plot';

function App() {
  const formData = createDefaultFormData();
  const sampleData = generateSampleData(100);
  
  return (
    <InteractivePlot
      formData={formData}
      dataContext={{ dataS: sampleData }}
      onDataPointHover={(point) => console.log('Hovered:', point)}
      onDateRangeSelect={(range) => console.log('Selected range:', range)}
      onZoomChange={(isZoomed, range) => console.log('Zoom changed:', isZoomed, range)}
    />
  );
}

Advanced Usage
tsx

import { InteractivePlot } from 'solidjs-interactive-plot';
import { createSignal } from 'solid-js';

function AdvancedChart() {
  const [data, setData] = createSignal([]);
  const [hasMore, setHasMore] = createSignal(true);
  
  const handleLoadMore = async () => {
    // Load more data from your API
    const newData = await fetchMoreData();
    setData(prev => [...prev, ...newData]);
    setHasMore(newData.length > 0);
  };
  
  const customFormatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  return (
    <InteractivePlot
      dataContext={{ 
        dataS: data(),
        hasMoreData: hasMore()
      }}
      formatDate={customFormatDate}
      onLoadMore={handleLoadMore}
      className="my-chart"
      style={{ border: "1px solid #ccc" }}
    />
  );
}

API Reference
InteractivePlotProps

Prop	Type	Description
formData	UsePlotVariablesReturnType	Configuration object for plot dimensions and settings
dataContext	PlotDataContext	Data and metadata for the plot
formatDate	(date: Date) => string	Custom date formatting function
onDataPointHover	(point: DataPoint | undefined) => void	Callback when hovering over data points
onDateRangeSelect	(range: DateRange | null) => void	Callback when selecting date ranges
onZoomChange	(isZoomed: boolean, range: DateRange | null) => void	Callback when zoom state changes
onLoadMore	() => void	Callback for loading more data
className	string	CSS class name for the root element
style	Record<string, string | number>	Inline styles for the root element

DataPoint
typescript

interface DataPoint {
    date: Date | string;
    close: number;
    idx: number;
    [key: string]: any;
}

PlotDataContext
typescript

interface PlotDataContext {
    dataS: DataPoint[];
    hasMoreData?: boolean;
    refetch?: any[];
}

UsePlotVariablesReturnType
typescript

interface UsePlotVariablesReturnType {
    width: Accessor<number>;
    height: Accessor<number>;
    tickCount: Accessor<number>;
    plotType: Accessor<string>;
    plotTypes: string[];
    incrementWidth: () => void;
    decrementWidth: () => void;
    incrementHeight: () => void;
    decrementHeight: () => void;
    setPt: (index: number) => void;
}

Utility Functions
createDefaultFormData()

Creates default form data configuration for the plot:
typescript

const formData = createDefaultFormData();
// Returns configured signals for width, height, tick count, and plot type

generateSampleData(count)

Generates sample data for testing:
typescript

const sampleData = generateSampleData(100); // 100 data points

formatDate(date)

Default date formatting function:
typescript

const formatted = formatDate(new Date()); // "12/25/2023"

validateDataPoint(point)

Validates if an object is a valid DataPoint:
typescript

const isValid = validateDataPoint(someObject);

validateDataArray(data)

Filters an array to contain only valid DataPoints:
typescript

const validData = validateDataArray(rawData);

Interactive Features
Date Selection

The component supports two methods for selecting date ranges:

    Drawing Mode: Click "Draw Select" and drag to select a range
    Manual Selection: Use the date input fields to specify exact dates

Zoom and Pan

    Zoom to Selection: After selecting a date range, click "Zoom to Selection"
    Pan Controls: Use the slider or drag the chart to navigate
    Mouse Controls:
        Ctrl/Cmd + Mouse Wheel: Zoom in/out
        Mouse Wheel: Pan left/right
        Click and Drag: Pan when zoomed

Plot Types

    Discrete: Shows vertical lines from x-axis to data points
    Continuous: Shows connected line graph between data points

Styling

The component uses inline styles but can be customized with CSS classes:
css

.my-chart {
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.my-chart svg {
  background: #fafafa;
}

Data Loading

For dynamic data loading, implement the onLoadMore callback:
typescript

const handleLoadMore = async () => {
  try {
    const newData = await api.fetchMoreData({
      after: data().length > 0 ? data()[data().length - 1].date : null,
      limit: 50
    });
    
    setData(prev => [...prev, ...newData]);
    setHasMore(newData.length === 50); // Assuming 50 is the page size
  } catch (error) {
    console.error('Failed to load more data:', error);
    setHasMore(false);
  }
};

Development
Building
bash

npm run build

Development Mode
bash

npm run dev

Publishing
bash

npm run prepublishOnly
npm publish

Browser Support

This component works in all modern browsers that support:

    ES2020 features
    SVG rendering
    CSS Grid and Flexbox

Performance Considerations

    The component efficiently handles large datasets through windowing
    Use the pan and zoom features to navigate large datasets
    Consider implementing virtual scrolling for extremely large datasets (>10k points)
    Data validation is performed to ensure type safety

Contributing

    Fork the repository
    Create a feature branch
    Make your changes
    Add tests if applicable
    Submit a pull request

License

MIT License - see LICENSE file for details.
Changelog
1.0.0

    Initial release
    Interactive zooming and panning
    Date range selection
    Multiple plot types
    TypeScript support
    Comprehensive API

