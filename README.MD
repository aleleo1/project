# Project

A web application for visualizing, tracking, and downloading time series data (potentially sensor or scientific data) with interactive charts and historical state management.

## Features

- **Interactive Data Visualization**:  
  Displays time series data using interactive charts. Users can zoom, filter, and explore data dynamically.
- **Multiple Data States**:  
  Supports toggling between several query "states" (default, normal, watch, advisory, volcanic cloud tracking, eruption classification), enabling comparison and tracking of different data scenarios.
- **Historical Navigation**:  
  URL state is kept in sync, allowing users to bookmark/share specific visualizations or filter configurations.
- **Responsive Design**:  
  Automatically adapts layout based on device (desktop, tablet, mobile).
- **Download as HTML**:  
  Users can export the current visualization as a standalone HTML file via the `/api/download` endpoint.
- **SolidJS & Astro**:  
  Built with Astro for SSR, SolidJS for reactivity, and D3 for charting.
- **MySQL Backend**:  
  Data is loaded via server-side queries to a MySQL database.

---

## File Tree

<details>
<summary>Click to expand</summary>

```
project/
├── astro.config.mjs
├── package.json
├── src/
│   ├── components/
│   │   ├── Download.astro         # Download button and logic
│   │   ├── Storico.astro          # Main historical data visualization component
│   │   └── Container.astro        # Data container (not shown, but referenced)
│   ├── contexts/
│   │   ├── chartContext.tsx       # Provides chart state/context (zoom, axes, etc.)
│   │   └── dataContext.tsx        # Provides data state/context (query, filters, etc.)
│   ├── db/
│   │   └── mysql-adapter.ts       # MySQL database adapter (custom Astro integration)
│   ├── interfaces.ts              # TypeScript interfaces for data and context
│   ├── layouts/
│   │   └── Layout.astro           # Main HTML layout
│   ├── pages/
│   │   ├── index.astro            # App entry point, renders <Storico/>
│   │   └── api/
│   │       └── download.ts        # API endpoint for downloading current view as HTML
│   ├── styles/
│   │   └── app.css                # App-wide CSS, includes color variables
│   ├── utils.ts                   # Utility functions (URL/state management, device detection, etc.)
│   └── constants.ts               # Query constants and defaults
└── ...
```
</details>

---

## Usage

1. **Install dependencies**  
   ```
   npm install
   ```

2. **Configure MySQL connection**  
   Edit `src/db/mysql-adapter.ts` and/or `.env` with your database credentials.

3. **Run the app**  
   ```
   npm run dev
   ```
   The app will be available at `http://localhost:4321/` by default.

4. **Interact**  
   - Explore and filter time series data via the UI.
   - Download the current visualization with the "Download" button.

---

## Technical Notes

- **Astro** is used for SSR and routing.
- **SolidJS** drives the reactive UI (contexts, signals, etc.).
- **D3** is used for chart scaling and zooming.
- **MySQL** is required for backend data.
- Designed for scientific/engineering data visualization with historical context and export features.

---

## License

[MIT](LICENSE) *(replace with your license if needed)*
