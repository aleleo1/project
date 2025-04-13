import type { APIRoute } from 'astro';
import {query_full} from '../../db/mysql-adapter';

export const GET: APIRoute = async (req) => {
  try {
    const params = req.url.searchParams
    const date = new Date(params.get('date')!)
    const q = params.get('q')!
    const rif = new Date(params.get('rif')!)
    const action = params.get('action')!
    console.log(params)
    const result = (await query_full(date, q!, rif, action))
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};