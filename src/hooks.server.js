import { dev } from "$app/environment";

export function handle({ event, resolve }) {
  if (
    dev &&
    event.url.pathname === "/.well-known/appspecific/com.chrome.devtools.json"
  ) {
    return new Response(undefined, { status: 404 });
  }

  if (typeof import.meta.url === "undefined") {
    globalThis.import = { meta: { url: "file:///app/" } };
  }

  return resolve(event);
}
