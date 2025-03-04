import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
// import { getSessionCookie } from "better-auth";

export const runtime = "experimental-edge";

export async function middleware(request: NextRequest) {
    // This doesn't work in Pages for whatever reason
    // const sessionCookie = getSessionCookie(request);

    // This does
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("better-auth.session_token");

    if (!sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard"],
};
