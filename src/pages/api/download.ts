// src/pages/api/ingv.ts (Replace the previous content)
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    try {

        const pageURL = new URL(request.url);
        const targetPageUrl = new URL('/?' + pageURL.searchParams.toString(), request.url);
        console.log(`Attempting to fetch internal page: ${targetPageUrl}`);

        // Make an internal server-side fetch request to the page endpoint.
        const response = await fetch(targetPageUrl, {
            // You might want to forward headers like User-Agent if your page logic depends on them
            headers: request.headers
        });

        console.log(`Internal fetch response status: ${response.status}`);

        // Check if the internal request was successful
        if (!response.ok) {
            // If fetching the internal page failed, return an error response
            const errorText = await response.text(); // Try to get the error body from the page response
            console.error(`Internal page fetch failed: ${response.status} ${response.statusText}\n${errorText}`);
            return new Response(`Error fetching internal page content: ${response.statusText}\n${errorText}`, {
                status: response.status, // Return the status code from the failed internal fetch
                headers: { 'Content-Type': 'text/plain' }
            });
        }

        // Get the HTML content from the response body
        const finalRenderedHtml = await response.text();

        // Return the HTML content with download headers
        return new Response(finalRenderedHtml, {
            headers: {
                'Content-Type': 'text/html',
                'Content-Disposition': 'attachment; filename="ingv.html"'
            }
        });

    } catch (error) {
        console.error("An unexpected error occurred during API execution:", error);
        // Handle any errors that occurred during the fetch or processing
        return new Response('An internal server error occurred.', {
            status: 500
        });
    }
};