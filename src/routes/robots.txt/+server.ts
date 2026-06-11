import { DENO_TIMELINE } from "$env/static/private";

export const GET = () => {
    const isProduction = DENO_TIMELINE === "production";

    const robotsContent = isProduction
        ? `User-agent: *
Allow: /`
        : `User-agent: *
Disallow: /`;

    return new Response(robotsContent, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-store, must-revalidate",
        },
    });
}