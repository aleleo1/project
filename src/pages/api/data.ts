import type { APIRoute } from 'astro';
import {MySQLAdapter} from '../../db/mysql-adapter';
import { formatDate } from '../../utils';

export const GET: APIRoute = async ({ request }) => {
  try {
    // Get MySQL adapter
    console.log(request.url)
    const mysql = new MySQLAdapter();
    const queries = {
    q1 : (date= new Date()) => `SELECT Date AS date, coalesce(VRP,0) AS close FROM modis_etna_nrt where Date <= CURRENT_DATE and EXTRACT(MONTH FROM DATE) >= EXTRACT(MONTH FROM cast('${formatDate(date)}' as DATE) - 6) and vrp is not null ORDER BY date DESC LIMIT 300;`,
    q2 : 'WITH DATAS AS (SELECT Date AS date, coalesce(VRP,0) AS close, ROW_NUMBER() OVER (PARTITION BY DATE_FORMAT(Date, \'\%Y-\%m\') ORDER BY Date ASC) AS RN FROM modis_etna_nrt where vrp is not null ) SELECT * FROM DATAS ORDER BY date ASC LIMIT 300;'
  }
    console.log(queries.q1())
    const data = await mysql.query(queries.q1());
    
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