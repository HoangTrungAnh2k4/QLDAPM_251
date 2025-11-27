import { NextRequest, NextResponse } from 'next/server';

const publicPaths = ['/', '/login', '/register'];

function isPublicPath(pathname: string) {
    return publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
}

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl;

    if (isPublicPath(pathname)) {
        return NextResponse.next();
    }

    const token = req.cookies.get('access_token')?.value;

    if (!token) {
        const loginUrl = new URL('/login', req.url);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

// Áp dụng middleware cho toàn bộ app trừ static + api
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
