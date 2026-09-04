import { env } from "../config/env.js";
import { mapGoogleVolume } from "../mappers/googleBooksMapper.js";

function maskKey(key) {
  if (!key) return "(none)";
  if (key.length <= 8) return "***";
  return `${key.slice(0, 4)}…${key.slice(-4)}`;
}

function normalizeQuery(query) {
  return String(query || "")
    .trim()
    .replace(/\s+/g, " ");
}

function buildGoogleBooksUrl(normalizedQuery) {
  const params = new URLSearchParams();
  params.set("q", normalizedQuery);
  params.set("maxResults", "10");
  params.set("printType", "books");
  if (env.GOOGLE_BOOKS_API_KEY) {
    params.set("key", env.GOOGLE_BOOKS_API_KEY);
  }
  return `https://www.googleapis.com/books/v1/volumes?${params.toString()}`;
}

function buildGoogleVolumeUrl(externalId) {
  const params = new URLSearchParams();
  if (env.GOOGLE_BOOKS_API_KEY) {
    params.set("key", env.GOOGLE_BOOKS_API_KEY);
  }
  const qs = params.toString();
  return `https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(externalId)}${qs ? `?${qs}` : ""}`;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status) {
  return status === 503 || status === 429 || status === 502;
}

function userFacingGoogleError(status) {
  if (status === 429) {
    return "Google Books rate limit reached. Please wait a moment and try again.";
  }
  if (status === 503 || status === 502) {
    return "Google Books is temporarily unavailable. Please try again in a few seconds.";
  }
  return "Google Books search failed. Please try again.";
}

async function fetchGoogleBooksOnce(url, label) {
  let res;
  try {
    res = await fetch(url);
  } catch (networkErr) {
    console.error("[Google Books] network error", {
      label,
      message: networkErr.message,
      cause: networkErr.cause,
    });
    const err = new Error(
      "Google Books is temporarily unavailable. Please try again in a few seconds."
    );
    err.statusCode = 503;
    throw err;
  }

  const rawBody = await res.text();
  let json = null;
  try {
    json = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    json = null;
  }

  return { res, rawBody, json };
}

function throwGoogleError(res, rawBody, json, label) {
  const googleMessage =
    json?.error?.message ||
    json?.error?.errors?.[0]?.message ||
    rawBody.slice(0, 500) ||
    res.statusText;

  console.error("[Google Books] API error", {
    httpStatus: res.status,
    label,
    googleMessage,
    bodyPreview: rawBody.slice(0, 800),
  });

  const err = new Error(userFacingGoogleError(res.status));
  err.statusCode = isRetryableStatus(res.status) ? 503 : 502;
  throw err;
}

async function fetchWithRetries(url, label, maxAttempts = 3) {
  let last = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    last = await fetchGoogleBooksOnce(url, label);
    if (last.res.ok) {
      return last;
    }
    if (!isRetryableStatus(last.res.status) || attempt === maxAttempts) {
      break;
    }
    const delayMs = 500 * attempt;
    console.warn("[Google Books] retry", {
      label,
      attempt,
      status: last.res.status,
      delayMs,
    });
    await sleep(delayMs);
  }
  throwGoogleError(last.res, last.rawBody, last.json, label);
}

export async function searchExternalBooks(query) {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return [];
  }

  const url = buildGoogleBooksUrl(normalizedQuery);

  console.info("[Google Books] request", {
    query: normalizedQuery,
    hasApiKey: Boolean(env.GOOGLE_BOOKS_API_KEY),
    apiKeyMasked: maskKey(env.GOOGLE_BOOKS_API_KEY),
  });

  const { res, json } = await fetchWithRetries(url, normalizedQuery);

  if (!res.ok) {
    throwGoogleError(res, "", json, normalizedQuery);
  }

  const items = json?.items || [];
  console.info("[Google Books] success", {
    query: normalizedQuery,
    returned: items.length,
  });

  return items.map(mapGoogleVolume).filter(Boolean);
}

export async function getExternalBookById(externalId) {
  const id = String(externalId || "").trim();
  if (!id) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }

  const url = buildGoogleVolumeUrl(id);
  const { res, rawBody, json } = await fetchWithRetries(url, id);

  if (res.status === 404) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }

  if (!res.ok) {
    throwGoogleError(res, rawBody, json, id);
  }

  const mapped = mapGoogleVolume(json);
  if (!mapped) {
    const err = new Error("Book not found");
    err.statusCode = 404;
    throw err;
  }
  return mapped;
}
