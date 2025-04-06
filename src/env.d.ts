/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MYSQL_HOST: string;
    readonly MYSQL_USER: string;
    readonly MYSQL_PASSWORD: string;
    readonly MYSQL_DATABASE: string;
    readonly MYSQL_PORT: string;
    readonly MYSQL_CONNECTION_LIMIT: string;
    // Add other environment variables here
  }
  
  interface ImportMeta {
    readonly env: ImportMetaEnv;
    readonly mysql: any; 
  }