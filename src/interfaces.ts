export interface DataPoint {
    date: Date;
    close: number;
    index?: number;
    path?: string;
  }


 export interface MySQLAdapterConfig {
      host?: string;
      user?: string;
      password?: string;
      database?: string;
      port?: number;
      connectionLimit?: number;
  }

export interface Stato {
  full?: boolean;

}