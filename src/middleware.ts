import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { match } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";

let locales = ["en", "zh"];
let defaultLocale = "en";

function getLocale(request: NextRequest): string {
  const storedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (storedLocale && locales.includes(storedLocale)) {
    return storedLocale;
  }

  let headers = {
    "accept-language": request.headers.get("accept-language") || defaultLocale,
  };

  let languages = new Negotiator({ headers }).languages();

  try {
    return match(languages, locales, defaultLocale);
  } catch (error) {
    return defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const currentLocale = locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );

  const pathWithoutLocale = currentLocale
    ? pathname.replace(`/${currentLocale}`, "")
    : pathname;

  const isDomainQuery =
    pathWithoutLocale.split("/").length === 2 && pathWithoutLocale !== "/";
  if (isDomainQuery) return;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );
  if (pathnameHasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  const response = NextResponse.redirect(request.nextUrl);
  response.cookies.set("NEXT_LOCALE", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|icons|images|.*\\..*).*)"],
};
