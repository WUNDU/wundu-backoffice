import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

const BACKEND = process.env.BACKEND_API_BASE_URL ?? "";

async function proxyRequest(request: Request, params: { "*": string }) {
  const path = params["*"] ?? "";
  const url = new URL(request.url);
  const backendUrl = `${BACKEND}/${path}${url.search}`;

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("Content-Type", contentType);

  const auth = request.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

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
