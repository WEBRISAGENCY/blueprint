// Adds the Agency Bootcamp pop-up script to every HTML page on the site.
// Which pages actually show it is decided in /assets/bootcamp-popup.js.
// To turn the pop-up off sitewide, delete this file (or the script it loads) and redeploy.
const TAG = '<script src="/assets/bootcamp-popup.js" defer></script>';

export default async (request, context) => {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html") || response.status !== 200) return response;

  const html = await response.text();
  if (html.includes("/assets/bootcamp-popup.js")) return new Response(html, response);

  const i = html.toLowerCase().lastIndexOf("</body>");
  const out = i === -1 ? html + TAG : html.slice(0, i) + TAG + html.slice(i);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.delete("etag");
  return new Response(out, { status: response.status, statusText: response.statusText, headers });
};

export const config = {
  path: "/*",
  excludedPath: ["/assets/*", "/*.js", "/*.css", "/*.png", "/*.jpg", "/*.jpeg", "/*.webp", "/*.svg", "/*.ico", "/*.xml", "/*.txt", "/*.pdf", "/.netlify/*"],
};
