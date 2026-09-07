"use server";

import * as cheerio from "cheerio";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UrlMetadata {
  title: string | null;
  description: string | null;
  favicon: string | null;
}

/** Returned when the input URL is malformed. */
export interface MetadataError {
  error: string;
}

export type FetchMetadataResult = UrlMetadata | MetadataError;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Normalise a potentially relative favicon path to an absolute URL. */
function resolveUrl(href: string | undefined, origin: string): string | null {
  if (!href) return null;
  href = href.trim();
  if (!href) return null;

  try {
    // Handles absolute URLs (https://...), protocol-relative (//...), and
    // root-relative paths (/favicon.ico).
    return new URL(href, origin).toString();
  } catch {
    return null;
  }
}

/** Pick the first non-empty string from a list of candidates. */
function firstOf(...candidates: Array<string | undefined | null>): string | null {
  for (const c of candidates) {
    const trimmed = c?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Server Action
// ---------------------------------------------------------------------------

/**
 * Fetches and parses Open Graph / HTML metadata for a given URL.
 *
 * Extraction priority:
 *   title       → og:title → twitter:title → <title>
 *   description → og:description → twitter:description → meta[name=description]
 *   favicon     → link[rel~=icon] (highest rel-specificity first) → /favicon.ico
 *
 * Returns a `MetadataError` object if the URL is invalid or the fetch fails,
 * so callers can distinguish errors from a successful (but empty) result.
 */
export async function db_fetchUrlMetadata(
  rawUrl: string
): Promise<FetchMetadataResult> {
  // ── 1. Validate URL ──────────────────────────────────────────────────────
  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { error: "Invalid URL — please include the full address (e.g. https://example.com)." };
  }

  // Only allow http(s) to prevent SSRF via file://, ftp://, etc.
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { error: "Only http and https URLs are supported." };
  }

  const origin = parsed.origin; // e.g. "https://example.com"

  // ── 2. Fetch HTML ────────────────────────────────────────────────────────
  let html: string;
  try {
    const response = await fetch(parsed.toString(), {
      // Present as a real browser so sites don't block the request.
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; DevBookmarkBot/1.0; +https://github.com/devbookmark)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
      // Don't follow redirects to untrusted origins; limit the response size.
      redirect: "follow",
      signal: AbortSignal.timeout(8_000), // 8-second hard timeout
    });

    if (!response.ok) {
      return { error: `Could not fetch page (HTTP ${response.status}).` };
    }

    // Guard against unexpectedly large responses (e.g. binary downloads).
    const contentType = response.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return { error: "URL does not point to an HTML page." };
    }

    html = await response.text();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown network error";
    return { error: `Failed to fetch URL: ${message}` };
  }

  // ── 3. Parse with cheerio ────────────────────────────────────────────────
  try {
    const $ = cheerio.load(html);

    // -- Title ---------------------------------------------------------------
    const ogTitle       = $('meta[property="og:title"]').attr("content");
    const twitterTitle  = $('meta[name="twitter:title"]').attr("content");
    const htmlTitle     = $("title").first().text();
    const title = firstOf(ogTitle, twitterTitle, htmlTitle);

    // -- Description ---------------------------------------------------------
    const ogDesc       = $('meta[property="og:description"]').attr("content");
    const twitterDesc  = $('meta[name="twitter:description"]').attr("content");
    const metaDesc     = $('meta[name="description"]').attr("content");
    const description = firstOf(ogDesc, twitterDesc, metaDesc);

    // -- Favicon -------------------------------------------------------------
    // Prefer explicit apple-touch or shortcut icons; fall back to any rel=icon,
    // then the conventional /favicon.ico path.
    const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr("href");
    const shortcutIcon   = $('link[rel="shortcut icon"]').attr("href");
    // rel can be a space-separated list ("shortcut icon"), so use the ~= selector.
    const anyIcon        = $('link[rel~="icon"]').first().attr("href");
    const defaultFavicon = "/favicon.ico";

    const rawFavicon = firstOf(appleTouchIcon, shortcutIcon, anyIcon, defaultFavicon);
    const favicon = resolveUrl(rawFavicon ?? undefined, origin);

    return { title, description, favicon };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Parse error";
    return { error: `Failed to parse page metadata: ${message}` };
  }
}
