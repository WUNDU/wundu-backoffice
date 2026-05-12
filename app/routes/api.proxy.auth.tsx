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

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.text();

  const backendRes = await fetch(`${BACKEND}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

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

  return new Response(JSON.stringify(data), {
    status: backendRes.status,
    headers,
  });
}
