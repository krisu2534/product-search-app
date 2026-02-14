/**
 * Ensure photo filename has extension (.jpg if missing)
 */
export function ensurePhotoExtension(filename) {
  if (!filename || filename.length === 0) return filename
  const trimmed = String(filename).trim()
  if (!trimmed.match(/\.[a-zA-Z0-9]+$/)) {
    return trimmed + '.jpg'
  }
  return trimmed
}

/**
 * Build a URL-safe image path from a photo filename.
 * Encodes special characters like # (which breaks URLs as a fragment identifier).
 */
export function getImagePath(filename) {
  if (!filename) return null
  return '/images/' + encodeURIComponent(filename)
}

/**
 * Get normalized photo array from product
 */
export function getProductPhotos(product) {
  const ensure = ensurePhotoExtension
  return Array.isArray(product.Photo)
    ? product.Photo.map(photo => ensure(photo)).filter(photo => photo && photo.length > 0)
    : product.Photo
      ? [ensure(product.Photo)].filter(photo => photo && photo.length > 0)
      : []
}
