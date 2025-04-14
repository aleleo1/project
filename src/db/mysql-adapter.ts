import type { Data, DataPoint } from './../interfaces';
import type { AstroIntegration, AstroConfig } from 'astro';
import mysql from 'mysql2/promise';
import { formatDate } from '../utils';
import { loadEnv } from "vite";
import { Actions } from '../constants';

const { MYSQL_HOST,
  MYSQL_USER,
  MYSQL_PASSWORD,
  MYSQL_DATABASE,
  MYSQL_PORT } = loadEnv(process.env.NODE_ENV!, process.cwd(), "");
// Interface for MySQL connection configuration
interface MySQLAdapterOptions {
  host?: string;
  user?: string;
  password?: string;
  database?: string;
  port?: number;
  connectionLimit?: number;
}

// Default configuration with fallback to environment variables
const DEFAULT_CONFIG: MySQLAdapterOptions = {
  host: MYSQL_HOST,
  user: MYSQL_USER,
  password: MYSQL_PASSWORD,
  database: MYSQL_DATABASE,
  port: MYSQL_PORT ? parseInt(MYSQL_PORT as string) : 3306,
  connectionLimit: 10
};

class MySQLAdapter {
  private pool: mysql.Pool | null = null;
  private config: MySQLAdapterOptions;

  constructor(options: MySQLAdapterOptions = {}) {
    // Merge provided options with default configuration and environment variables
    this.config = { ...DEFAULT_CONFIG, ...options };
  }

  // Initialize database connection pool
  async connect() {
    if (this.pool) return this.pool;

    try {
      this.pool = mysql.createPool({
        host: this.config.host,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        port: this.config.port,
        connectionLimit: this.config.connectionLimit
      });

      // Test the connection
      const connection = await this.pool.getConnection();
      connection.release();
      console.log('MySQL database connection established successfully');

      return this.pool;
    } catch (error) {
      console.error('Failed to establish MySQL database connection:', error);
      throw error;
    }
  }

  // Execute a query with optional parameters
  async query(sql: string, params: any[] = []) {
    if (!this.pool) {
      await this.connect();
    }

    try {
      const [results] = await this.pool!.execute<any>(sql, params);
      await this.close();
      return results;
    } catch (error) {
      console.error('MySQL query execution error:', error);
      throw error;
    }
  }

  // Close the connection pool
  async close() {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('connection closed!')
    }
  }
}

// Astro integration function
export default function createMySQLAdapter(options: MySQLAdapterOptions = {}): AstroIntegration {
  const adapter = new MySQLAdapter(options);

  return {
    name: 'astro-mysql-adapter',
    hooks: {
      // Configure the adapter during Astro setup
      'astro:config:setup': async ({ config }: { config: AstroConfig }) => {
        // Optional: Add any necessary configuration logic
      },

      // Initialize database connection when development server starts
      'astro:server:setup': async () => {
        await adapter.connect();
      },

      // Close database connection when development server stops
      'astro:server:done': async () => {
        await adapter.close();
        console.log('connection closed')
      },

      // Close database connection after build
      'astro:build:done': async () => {
        await adapter.close();
        console.log('connection closed')
      }
    }
  };
}

export async function query(date: Date, searchParam: string, rif: Date, full = false) {
  const mysql = new MySQLAdapter();
  function getMonthDifference(date1: Date, date2: Date) {
    return (date2.getFullYear() - date1.getFullYear()) * 12 +
      (date2.getMonth() - date1.getMonth());
  }
  if (Math.abs(getMonthDifference(rif, date)) > 6 && !full) {
    rif = new Date(date)
    rif.setMonth(rif.getMonth() + 6)
  }

  const queries: { [key: string]: any } = {
    q1: (date = new Date()) => `SELECT Date AS date, coalesce(VRP,0) AS close FROM modis_etna_nrt where Date <= cast('${formatDate(rif)}' as DATE) and DATE >=  cast('${formatDate(date)}' as DATE) and vrp is not null ORDER BY date DESC;`,
    q2: 'WITH DATAS AS (SELECT Date AS date, coalesce(VRP,0) AS close, ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(Date, \'\%Y-\%m\') ORDER BY Date ASC) AS RN FROM modis_etna_nrt where vrp is not null ) SELECT * FROM DATAS ORDER BY date ASC LIMIT 300;'
  }
  const data: DataPoint[] = await mysql.query(queries[searchParam]!(date));
  return data

}


export async function query_full(
  date: Date,
  searchParam: string,
  start: Date,
  action: string
): Promise<Data[]> {
  const mysql = new MySQLAdapter();
  const partial = action === Actions.partial
  const full = action === Actions.full
  // Helper function to calculate month difference
  let rif = new Date()
  // Adjust 'rif' date if needed
  if (partial) {
    rif = new Date(date);
    rif.setMonth(rif.getMonth() + 6);
  } else if (full) {
    rif = start
  }
  // Define queries object
  const queries: { [key: string]: (date?: Date, rif?: Date) => string } = {
    // Class (FLAG1): Assessing the Thermal Activity Level

    // No Activity
    q1: (date = new Date()) => `SELECT Date AS date, coalesce(VRP,0) AS close FROM modis_etna_nrt where Date <= cast('${formatDate(rif)}' as DATE) and DATE >=  cast('${formatDate(date)}' as DATE) and vrp is not null ORDER BY date DESC;`,

    // Normal
    normal: (date = new Date(), rif = new Date()) => `
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'MODIS' AS Sensor
    FROM
        modis_etna_nrt
    WHERE
        VRP IS NOT NULL AND VRP > 0
        AND VRP <= 100
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'VIIRS' AS Sensor
    FROM
        viirs_etna_nrt
    WHERE
        VRP IS NOT NULL AND VRP > 0
        AND VRP <= 100
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'SLSTR' AS Sensor
    FROM
        slstr_etna_nrt
    WHERE
        VRP IS NOT NULL AND VRP > 0
        AND VRP <= 100
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    ORDER BY Date DESC;
        `,

    // Watch
    watch: (date = new Date(), rif = new Date()) => `
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'MODIS' AS Sensor
    FROM
        modis_etna_nrt
    WHERE
        VRP > 100
        AND VRP <= 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'VIIRS' AS Sensor
    FROM
        viirs_etna_nrt
    WHERE
        VRP > 100
        AND VRP <= 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'SLSTR' AS Sensor
    FROM
        slstr_etna_nrt
    WHERE
        VRP > 100
        AND VRP <= 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    ORDER BY Date DESC;
  `,

    // Advisory
    advisory: (date = new Date(), rif = new Date()) => `
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'MODIS' AS Sensor
    FROM
        modis_etna_nrt
    WHERE
        VRP > 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'VIIRS' AS Sensor
    FROM
        viirs_etna_nrt
    WHERE
        VRP > 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        COALESCE(VRP, 0) AS close,
        'SLSTR' AS Sensor
    FROM
        slstr_etna_nrt
    WHERE
        VRP > 500
        AND Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    ORDER BY Date DESC;
  `,

    // Class (FLAG2): Detecting Phenomena and Tracking

    // Example: Requires a 'volcanic_clouds' table (Illustrative)
    volcanicCloudsTracking: (date = new Date(), rif = new Date()) => `
    SELECT
        vc.\`Data (dd/mm/yy hh:mm)\` AS date,
        vc.\`Ash (km2)\` AS ASH_Total,
        vc.\`SO2 (km2)\` AS SO2,
        vc.\`Mix (km2)\` AS Mix,
        vc.\`Cumulative Area (km2)\` AS Cumulative_Area,
        COALESCE(m.VRP, 0) AS VRP_MODIS,
        COALESCE(v.VRP, 0) AS VRP_VIIRS,
        COALESCE(s.VRP, 0) AS VRP_SLSTR
    FROM
        volcaniccloud vc
    LEFT JOIN
        modis_etna_nrt m ON vc.\`Data (dd/mm/yy hh:mm)\` = m.Date
        AND m.Date <= cast('${formatDate(rif)}' as DATE) 
        AND m.Date >=  cast('${formatDate(date)}' as DATE)
    LEFT JOIN
        viirs_etna_nrt v ON vc.\`Data (dd/mm/yy hh:mm)\` = v.Date
        AND v.Date <= cast('${formatDate(rif)}' as DATE) 
        AND v.Date >=  cast('${formatDate(date)}' as DATE)
    LEFT JOIN
        slstr_etna_nrt s ON vc.\`Data (dd/mm/yy hh:mm)\` = s.Date
        AND s.Date <= cast('${formatDate(rif)}' as DATE) 
        AND s.Date >=  cast('${formatDate(date)}' as DATE)
    ORDER BY vc.\`Data (dd/mm/yy hh:mm)\` DESC;
  `,

    // Class (FLAG3): Eruption Classification

    // Example: Requires an 'eruptions' table (Illustrative)
    eruptionClassification: (date = new Date(), rif = new Date()) => `
    SELECT
        Date as date,
        CASE
            WHEN COALESCE(VRP, 0) > 1000 THEN 'Paroxysm'  -- Hypothetical threshold
            WHEN COALESCE(VRP, 0) > 500 THEN 'Major/Strombolian' -- Hypothetical threshold
            ELSE 'Effusive'  -- Hypothetical default
        END AS eruption_type,
        COALESCE(VRP, 0) AS VRP_MODIS,
        COALESCE(VRP, 0) AS VRP_VIIRS,
        COALESCE(VRP, 0) AS VRP_SLSTR
    FROM
        modis_etna_nrt
    WHERE
        Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        CASE
            WHEN COALESCE(VRP, 0) > 1000 THEN 'Paroxysm'
            WHEN COALESCE(VRP, 0) > 500 THEN 'Major/Strombolian'
            ELSE 'Effusive'
        END AS eruption_type,
        COALESCE(VRP, 0) AS VRP_MODIS,
        COALESCE(VRP, 0) AS VRP_VIIRS,
        COALESCE(VRP, 0) AS VRP_SLSTR
    FROM
        viirs_etna_nrt
    WHERE
        Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    UNION ALL
    SELECT
        Date as date,
        CASE
            WHEN COALESCE(VRP, 0) > 1000 THEN 'Paroxysm'
            WHEN COALESCE(VRP, 0) > 500 THEN 'Major/Strombolian'
            ELSE 'Effusive'
        END AS eruption_type,
        COALESCE(VRP, 0) AS VRP_MODIS,
        COALESCE(VRP, 0) AS VRP_VIIRS,
        COALESCE(VRP, 0) AS VRP_SLSTR
    FROM
        slstr_etna_nrt
    WHERE
        Date <= cast('${formatDate(rif)}' as DATE) 
        AND Date >=  cast('${formatDate(date)}' as DATE)
    ORDER BY Date DESC;
  `,
  };

  // Execute the query based on searchParam
  let queryToExecute = queries[searchParam];
  if (!queryToExecute) {
    throw new Error(`Invalid search parameter: ${searchParam}`);
  }
  console.log(`loading from ${formatDate(rif)} to ${formatDate(date)} with query: ${queries[searchParam](date, rif)}`)

  const data: any[] = await mysql.query(queryToExecute(date, rif));
  return data;
}


// Export the MySQL adapter class for direct usage if needed
export { MySQLAdapter };