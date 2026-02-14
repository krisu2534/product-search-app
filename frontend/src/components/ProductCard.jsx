import { useState } from 'react'
import { copyImageToClipboard, copyImagesToClipboardBulk } from '../utils/copyImage'
import { getProductPhotos, getImagePath } from '../utils/photoHelpers'

function ProductCard({ product, onAddToCollection }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [thumbnailErrors, setThumbnailErrors] = useState({})

  const photos = getProductPhotos(product)
  const currentImage = photos[selectedImageIndex] || null
  const imagePath = getImagePath(currentImage)

  // Reset error state when image changes
  const handleImageChange = (index) => {
    setSelectedImageIndex(index)
    setImageLoadError(false)
    setImageLoaded(false)
  }

  const handleMainImageLoad = () => {
    setImageLoaded(true)
    setImageLoadError(false)
  }

  const handleMainImageError = () => {
    setImageLoadError(true)
    setImageLoaded(false)
    console.error(`Failed to load main image for product ${product.ID || product.id}:`, {
      photoFilename: currentImage,
      fullPath: imagePath
    })
  }

  const handleCopyImage = () => {
    if (imageLoadError) {
      alert(`Cannot copy image: The image file "${currentImage}" could not be loaded.\n\nPlease check:\n1. The file exists in the images folder\n2. The filename matches exactly (including spaces and special characters)\n3. The file is not corrupted`)
      return
    }
    copyImageToClipboard(imagePath, currentImage || 'product-image.png')
  }

  const handleCopyBulk = () => {
    copyImagesToClipboardBulk(
      photos.map((p) => getImagePath(p)),
      'product-images.png'
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Gallery Section */}
      <div className="relative bg-gray-100 aspect-square">
        {currentImage ? (
          <>
            {imageLoadError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-red-500 p-4">
                <svg
                  className="w-16 h-16 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-sm text-center">Image not found</p>
                <p className="text-xs text-gray-500 mt-1 text-center break-all px-2">{currentImage}</p>
              </div>
            ) : (
              <>
                <img
                  src={imagePath}
                  alt={product.Name || 'Product image'}
                  className="w-full h-full object-contain"
                  onLoad={handleMainImageLoad}
                  onError={handleMainImageError}
                />
            {/* Copy Button */}
            <button
              onClick={handleCopyImage}
              disabled={imageLoadError}
              className={`absolute top-2 right-2 px-4 py-2 rounded-lg shadow-lg font-medium transition-colors flex items-center gap-2 ${
                imageLoadError
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
              title={imageLoadError ? 'Image cannot be loaded' : 'Copy image to clipboard'}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copy Image
            </button>
            {/* Right side: Collect (above) and Copy Bulk (below, when multiple photos) */}
            <div className="absolute bottom-2 right-2 flex flex-col gap-2 items-end">
              {onAddToCollection && !imageLoadError && currentImage && (
                <button
                  onClick={() => onAddToCollection(imagePath, currentImage || 'product-image.png')}
                  className="p-2 rounded-lg shadow-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors"
                  title="Add to collection"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </button>
              )}
              {photos.length > 1 && (
                <button
                  onClick={handleCopyBulk}
                  className="p-2 rounded-lg shadow-lg bg-indigo-500 hover:bg-indigo-600 text-white transition-colors"
                  title="Copy all images"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
                    />
                  </svg>
                </button>
              )}
            </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg
              className="w-16 h-16"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {photos.length > 1 && (
        <div className="p-2 bg-gray-50 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => {
            const thumbnailPath = getImagePath(photo)
            const thumbnailError = thumbnailErrors[index] || false
            return (
              <button
                key={index}
                onClick={() => handleImageChange(index)}
                className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden transition-all relative ${
                  index === selectedImageIndex
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : thumbnailError
                    ? 'border-red-300'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                title={thumbnailError ? `Image not found: ${photo}` : `Select image ${index + 1}`}
              >
                {thumbnailError ? (
                  <div className="w-full h-full flex items-center justify-center bg-red-50 text-red-400">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={thumbnailPath}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Failed to load thumbnail ${index + 1} for product:`, {
                        productId: product.ID || product.id,
                        photoFilename: photo,
                        fullPath: thumbnailPath
                      })
                      setThumbnailErrors(prev => ({ ...prev, [index]: true }))
                      e.target.style.display = 'none'
                    }}
                  />
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Product Info */}
      <div className="p-4">
        {Object.entries(product).map(([key, value]) => {
          // Skip Photo column as it's already displayed
          if (key === 'Photo') return null
          
          // Skip empty values
          if (!value || (Array.isArray(value) && value.length === 0)) return null

          return (
            <div key={key} className="mb-2 last:mb-0">
              <span className="font-semibold text-gray-700 capitalize">
                {key.replace(/_/g, ' ')}:
              </span>{' '}
              <span className="text-gray-600">
                {Array.isArray(value) ? value.join(', ') : String(value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ProductCard
