import type { ActionFunctionArgs } from "@remix-run/node";

const BACKEND = process.env.BACKEND_API_BASE_URL ?? "";
const COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/api/proxy/auth";

function parseCookieValue(header: string, name: string): string | null {
  const match = header.match(new RegExp(`(?:^|,)\\s*${name}=([^;,]+)`));
  return match ? match[1].trim() : null;
}

function parseCookieMaxAge(header: string): number | null {
  const match = header.match(/max-age=(\d+)/i);
  return match ? Number(match[1]) : null;
}

function getCookieFromHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieFromHeader(cookieHeader, COOKIE_NAME);

  const backendRes = await fetch(`${BACKEND}/auth/refresh`, {
    method: "POST",
    headers: token ? { Cookie: `${COOKIE_NAME}=${token}` } : {},
  });

  if (!backendRes.ok) {
    return new Response(JSON.stringify({}), {
      status: backendRes.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  const data = await backendRes.json().catch(() => ({}));

  const headers = new Headers({ "Content-Type": "application/json" });

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) {
    const value = parseCookieValue(setCookie, COOKIE_NAME);
    const maxAge = parseCookieMaxAge(setCookie);
    if (value) {
      const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
      headers.append(
        "Set-Cookie",
        `${COOKIE_NAME}=${value}; HttpOnly${secure}; SameSite=Strict; Path=${COOKIE_PATH}; Max-Age=${maxAge ?? 30 * 24 * 60 * 60}`
      );
    }
  }

  return new Response(JSON.stringify(data), { status: 200, headers });
}
