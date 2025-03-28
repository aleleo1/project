import type { APIRoute } from 'astro';
import {query} from '../../db/mysql-adapter';

export const GET: APIRoute = async (req) => {
  try {
    const params = req.url.searchParams
    const date = new Date(params.get('data')!)
    const q = params.get('q')!
    console.log(params)
    const result = (await query(date, q!))
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
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