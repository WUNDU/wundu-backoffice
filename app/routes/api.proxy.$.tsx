import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

const BACKEND = process.env.BACKEND_API_BASE_URL ?? "";
const REFRESH_COOKIE = "refresh_token";

function getCookieFromHeader(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? match[1] : null;
}

async function proxyRequest(request: Request, params: { "*": string }) {
  const path = params["*"] ?? "";
  const url = new URL(request.url);
  const backendUrl = `${BACKEND}/${path}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const auth = request.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  // Forward the refresh_token cookie so auth/refresh and auth/logout
  // work correctly even when routed through this catch-all
  const cookieHeader = request.headers.get("cookie");
  const refreshToken = getCookieFromHeader(cookieHeader, REFRESH_COOKIE);
  if (refreshToken) {
    headers.set("Cookie", `${REFRESH_COOKIE}=${refreshToken}`);
  }

  const hasBody = !["GET", "HEAD", "DELETE"].includes(request.method.toUpperCase());
  const body = hasBody ? await request.text() : undefined;

  const backendRes = await fetch(backendUrl, {
    method: request.method,
    headers,
    body,
  });

  const responseBody = await backendRes.text();

  return new Response(responseBody || null, {
    status: backendRes.status,
    headers: {
      "Content-Type": backendRes.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  return proxyRequest(request, params as { "*": string });
}

export async function action({ request, params }: ActionFunctionArgs) {
  return proxyRequest(request, params as { "*": string });
}

