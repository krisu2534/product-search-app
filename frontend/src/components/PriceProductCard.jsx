import { useState } from 'react'
import { copyImageToClipboard, copyImagesToClipboardBulk } from '../utils/copyImage'
import { getProductPhotos, getImagePath } from '../utils/photoHelpers'
const PRICE_KEYS = [
  'Price step 1', 'Price step 2', 'Price step 3', 'Price step 4', 'Price step 5',
  'Price 1', 'Price 2', 'Price 3', 'Price 4', 'Price 5'
]
const NOTE_KEY = 'Note'
const STATUS_KEY = 'สถานะ'
const STOCK_KEY = 'สต็อคจำนวน'
const PRODUCT_DETAIL_KEYS = ['Product detail', 'Product Detail', 'ProductDetail']
const PRODUCT_NAME_KEYS_CARD = ['Name', 'name', 'ชื่อ', 'Product Name', 'Product name']

function buildFullProductText(product) {
  const lines = []
  const productName = PRODUCT_NAME_KEYS_CARD.map((k) => product[k]).find((v) => v != null && v !== '')
  const productDetailKey = PRODUCT_DETAIL_KEYS.find((k) => product[k] != null && product[k] !== '')
  const productDetailValue = productDetailKey ? product[productDetailKey] : null
  if (productName) lines.push(productName)
  if (productDetailValue) lines.push(productDetailValue)
  PRICE_KEYS.forEach((key) => {
    const v = product[key]
    if (v != null && v !== '') {
      lines.push(String(v).replace(/\s*\([A-Z]\)\s*$/, '').trim())
    }
  })
  if (product[NOTE_KEY]) lines.push(String(product[NOTE_KEY]))
  return lines.join('\n')
}

function PriceProductCard({ product, onAddToCollection, onAddProductInfoToCollection, onAddToCombined, hideCopyAndCollect, maxCombinedImagesReached, initialSelectedImageIndex = 0 }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(initialSelectedImageIndex)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [thumbnailErrors, setThumbnailErrors] = useState({})

  const photos = getProductPhotos(product)
  const currentImage = photos[selectedImageIndex] || null
  const imagePath = getImagePath(currentImage)

  const handleImageChange = (index) => {
    setSelectedImageIndex(index)
    setImageLoadError(false)
  }

  const handleMainImageError = () => {
    setImageLoadError(true)
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

  const copyPriceStepText = (stepLabel, value) => {
    const fullText = `${stepLabel}: ${value}`
    const textWithoutABC = fullText.replace(/\s*\([A-Z]\)\s*$/, '').trim()
    navigator.clipboard?.writeText(textWithoutABC).catch(() => {})
  }

  const PRODUCT_NAME_KEYS = ['Name', 'name', 'ชื่อ', 'Product Name', 'Product name']

  const productDetailKeys = Object.keys(product).filter(
    (k) =>
      k !== 'Photo' &&
      !PRICE_KEYS.includes(k) &&
      k !== NOTE_KEY &&
      k !== STATUS_KEY &&
      k !== STOCK_KEY &&
      k !== 'ID' &&
      k !== 'id' &&
      !PRODUCT_NAME_KEYS.includes(k) &&
      !PRODUCT_DETAIL_KEYS.includes(k)
  )

  const productName = PRODUCT_NAME_KEYS.map((k) => product[k]).find((v) => v != null && v !== '')
  const stockQty = product[STOCK_KEY]
  const productDetailKey = PRODUCT_DETAIL_KEYS.find((k) => product[k] != null && product[k] !== '')
  const productDetailValue = productDetailKey ? product[productDetailKey] : null
  const status = product[STATUS_KEY]

  const priceSteps = PRICE_KEYS.map((key) => ({ key, value: product[key] }))
  const hasPriceSteps = priceSteps.some((p) => p.value != null && p.value !== '')
  const note = product[NOTE_KEY]

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-stretch">
        {/* Left column: image + thumbnails - smaller on desktop */}
        <div className="flex-shrink-0 md:w-48">
          <div className="relative bg-gray-100 w-full aspect-square md:w-48 md:h-48">
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
                  onError={handleMainImageError}
                />
                {/* Copy Image Button - hidden when hideCopyAndCollect */}
                {!hideCopyAndCollect && (
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
                )}
                {/* Add to collection & Add to combined & Copy all images */}
                <div className="absolute bottom-2 right-2 flex flex-col gap-2 items-end">
                  {!hideCopyAndCollect && onAddToCollection && !imageLoadError && currentImage && (
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
                  {onAddToCombined && !imageLoadError && currentImage && !maxCombinedImagesReached && (
                    <button
                      onClick={() => onAddToCombined(imagePath, '', productName || 'Product')}
                      className="p-2 rounded-lg shadow-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
                      title="Add main photo to combined (max 4)"
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
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                        />
                      </svg>
                    </button>
                  )}
                  {!hideCopyAndCollect && photos.length > 1 && (
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
            <div className="p-2 bg-gray-50 flex gap-2 overflow-x-auto md:flex-wrap">
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
                    onError={() => {
                      setThumbnailErrors((prev) => ({ ...prev, [index]: true }))
                    }}
                  />
                )}
              </button>
            )
          })}
            </div>
          )}
        {/* สถานะ + สต็อคจำนวน - desktop: left column below thumbnails */}
        {((status != null && status !== '') || (stockQty != null && stockQty !== '')) && (
          <div className="hidden md:flex flex-col gap-2 p-3 bg-gray-50 border-t border-gray-200">
            {status != null && status !== '' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium" title="สถานะ">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{String(status)}</span>
              </div>
            )}
            {stockQty != null && stockQty !== '' && (
              <div className="text-sm text-gray-600">
                <span className="font-semibold text-gray-700">สต็อคจำนวน: </span>
                {String(stockQty)}
              </div>
            )}
          </div>
        )}
        </div>

        {/* Product Info - right side on desktop */}
        <div className="relative p-3 md:p-4 md:flex-1 md:flex md:flex-col md:justify-center min-w-0">
        {/* สถานะ (Status) + สต็อคจำนวน - top right on desktop, inline on mobile */}
        {(status != null && status !== '') || (stockQty != null && stockQty !== '') ? (
          <>
            {/* Mobile: inline in content flow */}
            <div className="flex flex-wrap gap-2 mb-2 md:hidden">
              {status != null && status !== '' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-sm font-medium" title="สถานะ">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{String(status)}</span>
                </div>
              )}
              {stockQty != null && stockQty !== '' && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold text-gray-700">สต็อคจำนวน: </span>
                  {String(stockQty)}
                </div>
              )}
            </div>
          </>
        ) : null}
        <div>
        {/* 1. Product Name + copy + collect */}
        {productName && (
          <div className="mb-2 flex items-center gap-2">
            <div className="font-semibold text-gray-800 text-lg flex-1 min-w-0">{productName}</div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!hideCopyAndCollect && (
                <button
                  onClick={() => navigator.clipboard?.writeText(productName).catch(() => {})}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              {!hideCopyAndCollect && onAddProductInfoToCollection && (
                <button
                  onClick={() => onAddProductInfoToCollection(productName, productName)}
                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                  title="Add to collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
              {onAddToCombined && (
                <button
                  onClick={() => onAddToCombined(null, productName, productName)}
                  className="p-1.5 rounded hover:bg-cyan-100 text-cyan-600 transition-colors"
                  title="Add to combined (text only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {/* 2. ID + copy + add to combined */}
        {(product.ID || product.id) != null && (product.ID || product.id) !== '' && (
          <div className="mb-2 flex items-center gap-2">
            <span className="font-semibold text-gray-700">ID: </span>
            <span className="text-gray-600 flex-1">{String(product.ID || product.id)}</span>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!hideCopyAndCollect && (
                <button
                  onClick={() => navigator.clipboard?.writeText(String(product.ID || product.id)).catch(() => {})}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              {onAddToCombined && (
                <button
                  onClick={() => onAddToCombined(null, String(product.ID || product.id), productName ? `${productName} - ID` : 'ID')}
                  className="p-1.5 rounded hover:bg-cyan-100 text-cyan-600 transition-colors"
                  title="Add to combined (text only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {/* 3. Product detail + copy + collect */}
        {productDetailKey && productDetailValue && (
          <div className="mb-2 flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <span className="font-semibold text-gray-700 capitalize">
                {productDetailKey.replace(/_/g, ' ')}:
              </span>{' '}
              <span className="text-gray-600">{String(productDetailValue)}</span>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!hideCopyAndCollect && (
                <button
                  onClick={() => navigator.clipboard?.writeText(String(productDetailValue)).catch(() => {})}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              {!hideCopyAndCollect && onAddProductInfoToCollection && (
                <button
                  onClick={() => onAddProductInfoToCollection(String(productDetailValue), productName ? `${productName} - Detail` : 'Detail')}
                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                  title="Add to collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
              {onAddToCombined && (
                <button
                  onClick={() => onAddToCombined(null, String(productDetailValue), productName ? `${productName} - Detail` : 'Detail')}
                  className="p-1.5 rounded hover:bg-cyan-100 text-cyan-600 transition-colors"
                  title="Add to combined (text only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        {/* 5. Other product details */}
        {productDetailKeys.map((key) => {
          const value = product[key]
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

        {/* Price steps 1-5 - each with copy + collect */}
        {hasPriceSteps && (() => {
          const renderedSteps = priceSteps.filter((p) => p.value != null && p.value !== '')
          const lastIndex = renderedSteps.length - 1
          const makeLastFullWidth = renderedSteps.length % 2 === 1
          return (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <div className="font-semibold text-gray-700 mb-2">Price Steps</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {renderedSteps.map(({ key, value }, index) => {
                  const stepLabel = key.replace('Price step ', 'Step ')
                  const textWithoutABC = String(value).replace(/\s*\([A-Z]\)\s*$/, '').trim()
                  const stepText = `${stepLabel}: ${textWithoutABC}`
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 py-2.5 px-3 rounded-lg bg-gray-50 min-h-[2.75rem] ${index === lastIndex && makeLastFullWidth ? 'sm:col-span-2' : ''}`}
                    >
                      <span className="text-gray-600 flex-shrink-0">{stepLabel}:</span>
                      <span className="font-medium text-gray-800 flex-1 min-w-0">{String(value)}</span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!hideCopyAndCollect && (
                          <button
                            onClick={() => copyPriceStepText(stepLabel, value)}
                            className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                            title="Copy text (excludes A/B/C)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        )}
                        {!hideCopyAndCollect && onAddProductInfoToCollection && (
                          <button
                            onClick={() => onAddProductInfoToCollection(textWithoutABC, productName ? `${productName} - ${stepLabel}` : stepLabel)}
                            className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                            title="Add to collection"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        )}
                        {onAddToCombined && (
                          <button
                            onClick={() => onAddToCombined(null, textWithoutABC, productName ? `${productName} - ${stepLabel}` : stepLabel)}
                            className="p-1.5 rounded hover:bg-cyan-100 text-cyan-600 transition-colors"
                            title="Add to combined (text only)"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}

        {/* Note + copy + collect + add to combined */}
        {note != null && note !== '' && (
          <div className="mt-2 pt-2 border-t border-gray-200 flex items-start gap-2">
            <p className="text-gray-600 text-sm flex-1">
              <span className="font-semibold text-gray-700">Note: </span>
              {String(note)}
            </p>
            <div className="flex items-center gap-1 flex-shrink-0">
              {!hideCopyAndCollect && (
                <button
                  onClick={() => navigator.clipboard?.writeText(String(note)).catch(() => {})}
                  className="p-1.5 rounded hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Copy"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              {onAddToCombined && (
                <button
                  onClick={() => onAddToCombined(null, String(note), productName ? `${productName} - Note` : 'Note')}
                  className="p-1.5 rounded hover:bg-cyan-100 text-cyan-600 transition-colors"
                  title="Add to combined (text only)"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </button>
              )}
              {!hideCopyAndCollect && onAddProductInfoToCollection && (
                <button
                  onClick={() => onAddProductInfoToCollection(String(note), productName ? `${productName} - Note` : 'Note')}
                  className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600 transition-colors"
                  title="Add to collection"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        </div>
        </div>
      </div>
    </div>
  )
}

export default PriceProductCard
