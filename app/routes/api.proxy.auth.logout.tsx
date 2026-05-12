import type { ActionFunctionArgs } from "@remix-run/node";

const BACKEND = process.env.BACKEND_API_BASE_URL ?? "";
const COOKIE_NAME = "refresh_token";
const COOKIE_PATH = "/api/proxy/auth";

function getCookieFromHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

export async function action({ request }: ActionFunctionArgs) {
  const cookieHeader = request.headers.get("cookie");
  const token = getCookieFromHeader(cookieHeader, COOKIE_NAME);

  const forwardHeaders: Record<string, string> = {};
  if (token) forwardHeaders["Cookie"] = `${COOKIE_NAME}=${token}`;
  const auth = request.headers.get("authorization");
  if (auth) forwardHeaders["Authorization"] = auth;

  await fetch(`${BACKEND}/auth/logout`, {
    method: "POST",
    headers: forwardHeaders,
  }).catch(() => {});

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const headers = new Headers({
    "Content-Type": "application/json",
    "Set-Cookie": `${COOKIE_NAME}=; HttpOnly${secure}; SameSite=Strict; Path=${COOKIE_PATH}; Max-Age=0`,
  });

  return new Response(JSON.stringify({}), { status: 200, headers });
}
