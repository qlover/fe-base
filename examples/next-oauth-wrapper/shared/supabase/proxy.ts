import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { ROUTE_LOGIN, isPublicPath } from '@config/route';
import { SUPABASE_KEY, SUPABASE_URL } from './conts';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  // If the env vars are not set, skip proxy check. You can remove this
  // once you setup the project.
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return supabaseResponse;
  }

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(SUPABASE_URL!, SUPABASE_KEY!, {
    // global: {
    //   fetch: (input, init) => {
    //     console.log('proxy supabase globals fetch', input, init);

    //     return fetch(input, init);
    //   }
    // },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      }
    }
  });

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const pathname = request.nextUrl.pathname;
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  console.log('Proxy(supabase) logged?', !!user, user?.email);

  if (!user && !isPublicPath(pathname)) {
    // no user on protected route, redirect to login
    const url = request.nextUrl.clone();
    url.pathname = ROUTE_LOGIN;
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
