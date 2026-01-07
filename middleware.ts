import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that should NOT be geoblocked (e.g., public assets)
const PUBLIC_FILE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.js'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip geoblocking for static files
    if (PUBLIC_FILE_EXTENSIONS.some(ext => pathname.endsWith(ext))) {
        return NextResponse.next();
    }

    // 2. Geoblocking Logic
    // In Vercel, x-vercel-ip-country is provided. 
    // For local development, this header might be missing.
    const country = request.headers.get('x-vercel-ip-country') || 'GB'; // Default to GB for local ease

    // Only allow United Kingdom (GB)
    if (country !== 'GB' && !pathname.startsWith('/api')) {
        // If we want to block the UI for non-UK users
        // For now, let's just log it. In a real deployment, we'd redirect.
        console.log(`Blocked non-UK visitor from: ${country}`);
        // return new NextResponse('Belaboo is currently only available in the UK.', { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
