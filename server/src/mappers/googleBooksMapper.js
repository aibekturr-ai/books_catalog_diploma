function stripHtml(html) {
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

export function mapGoogleVolume(volume) {
  if (!volume || !volume.volumeInfo) return null;
  const info = volume.volumeInfo;
  const identifiers = info.industryIdentifiers || [];
  const isbn13 = identifiers.find((i) => i.type === "ISBN_13")?.identifier || null;
  const isbn10 = identifiers.find((i) => i.type === "ISBN_10")?.identifier || null;
  const image =
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    "https://picsum.photos/seed/nobook/400/600";
  const coverImage = image.replace("http://", "https://");

  return {
    externalId: volume.id,
    title: info.title || "Untitled",
    author: (info.authors && info.authors.join(", ")) || "Unknown",
    description: stripHtml(info.description || ""),
    coverImage,
    publishedDate: info.publishedDate || null,
    publisher: info.publisher || null,
    isbn10,
    isbn13,
    suggestedCategory: (info.categories && info.categories[0]) || null,
  };
}
