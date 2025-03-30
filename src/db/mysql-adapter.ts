import type { DataPoint } from './../interfaces';
import type { AstroIntegration, AstroConfig } from 'astro';
import mysql from 'mysql2/promise';
import { formatDate } from '../utils';

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
  host: import.meta.env.MYSQL_HOST || 'localhost',
  user: import.meta.env.MYSQL_USER || 'ufpv_manager',
  password: import.meta.env.MYSQL_PASSWORD,
  database: import.meta.env.MYSQL_DATABASE || 'ingv',
  port: import.meta.env.MYSQL_PORT ? parseInt(import.meta.env.MYSQL_PORT as string) : 3306,
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
      const [results] = await this.pool!.execute<DataPoint[]>(sql, params);
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
      },

      // Close database connection after build
      'astro:build:done': async () => {
        await adapter.close();
      }
    }
  };
}

export async function query (date: Date, searchParam: string, rif: Date, full = false) {
    const mysql = new MySQLAdapter();
    function getMonthDifference(date1: Date, date2: Date) {
      return (date2.getFullYear() - date1.getFullYear()) * 12 + 
      (date2.getMonth() - date1.getMonth());
  }
    if (Math.abs(getMonthDifference(rif, date)) > 6 && !full) {
      rif = new Date(date)
      rif.setMonth(rif.getMonth() + 6)
    } 

        const queries : {[key: string] : any} = {
        q1 : (date= new Date()) => `SELECT Date AS date, coalesce(VRP,0) AS close FROM modis_etna_nrt where Date <= cast('${formatDate(rif)}' as DATE) and DATE >=  cast('${formatDate(date)}' as DATE) and vrp is not null ORDER BY date DESC;`,
        q2 : 'WITH DATAS AS (SELECT Date AS date, coalesce(VRP,0) AS close, ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(Date, \'\%Y-\%m\') ORDER BY Date ASC) AS RN FROM modis_etna_nrt where vrp is not null ) SELECT * FROM DATAS ORDER BY date ASC LIMIT 300;'
      }
    const data = await mysql.query(queries[searchParam]!(date));
    return data
        
}

// Export the MySQL adapter class for direct usage if needed
export { MySQLAdapter };