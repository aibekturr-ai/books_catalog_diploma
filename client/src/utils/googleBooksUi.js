export function googleBooksErrorMessage(error, fallback = "Google Books search failed") {
  const status = error?.response?.status;
  const apiMessage = error?.response?.data?.message;
  if (apiMessage) return apiMessage;
  if (status === 503 || status === 502 || status === 429) {
    return "Google Books is temporarily unavailable. Please try again in a few seconds.";
  }
  return fallback;
}

export function stripHtmlClient(html) {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
