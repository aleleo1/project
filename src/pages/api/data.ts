import type { APIRoute } from 'astro';
import {MySQLAdapter} from '../../db/mysql-adapter';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get MySQL adapter
    const mysql = new MySQLAdapter();
    // Fetch all users
    const data = await mysql.query('SELECT Date as date, coalesce(VRP, 0) as close FROM modis_etna_nrt where vrp is not null and vrp != 0 ORDER BY Date desc limit 300');
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};