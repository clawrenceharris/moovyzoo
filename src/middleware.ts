import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// This will run for every request that matches the config.matcher paths
export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Get the current authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If no user, redirect to /login with `next` param so we can redirect back
  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Return response with synced cookies
  return supabaseResponse;
}

// Match only private routes
export const config = {
  matcher: [
    "/", // All main app routes
    "/profile/:path*", // Profile routes
    "/parties/:path*", // Party features
    "/habitats/:path*", // Group chats
  ],
};
