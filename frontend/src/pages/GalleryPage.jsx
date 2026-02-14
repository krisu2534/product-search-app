import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copyImageToClipboard, copyImagesToClipboardBulk } from '../utils/copyImage'
import { copyCompositeImageWithMainImage } from '../utils/copyCompositeImage'
import { getProductPhotos, getImagePath } from '../utils/photoHelpers'
import PriceProductCard from '../components/PriceProductCard'

const SIZE_OPTIONS = {
  medium: 'w-16 h-16',
  large: 'w-32 h-32',
  extraLarge: 'w-48 h-48'
}

function GalleryPage() {
  const [products, setProducts] = useState([])
  const [photoList, setPhotoList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [size, setSize] = useState('medium')
  const [collectedImages, setCollectedImages] = useState([])
  const [modalProduct, setModalProduct] = useState(null)
  const [modalPhotoIndex, setModalPhotoIndex] = useState(0)
  const [collectedCombinedImages, setCollectedCombinedImages] = useState([])
  const [collectedCombinedTexts, setCollectedCombinedTexts] = useState([])

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const list = []
    products.forEach(product => {
      const photos = getProductPhotos(product)
      photos.forEach(photo => {
        list.push({ photo, product })
      })
    })
    setPhotoList(list)
  }, [products])

  const fetchProducts = async () => {
    try {
      setError(null)
      let response = await fetch('/api/products-with-prices', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000)
      })
      if (response.status === 404) {
        response = await fetch('/api/products', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: AbortSignal.timeout(10000)
        })
      }
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const data = await response.json()
      if (!Array.isArray(data)) throw new Error('Invalid response format')
      setProducts(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching products:', err)
      setError(err.message || 'Failed to fetch products')
      setLoading(false)
    }
  }

  const sizeClass = SIZE_OPTIONS[size] || SIZE_OPTIONS.medium

  const handleAddToCollection = (imagePath, filename) => {
    setCollectedImages((prev) => [...prev, { imagePath, filename }])
  }

  const handleRemoveFromCollection = (index) => {
    setCollectedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearCollection = () => {
    setCollectedImages([])
  }

  const handleCopyCollectedBulk = () => {
    copyImagesToClipboardBulk(
      collectedImages.map((i) => i.imagePath),
      'collected-images.png'
    )
  }

  const openProductModal = (product, photoIndex) => {
    setModalProduct(product)
    setModalPhotoIndex(photoIndex)
  }

  const closeProductModal = () => {
    setModalProduct(null)
  }

  const handleAddToCombined = (imagePath, text, label) => {
    if (imagePath) {
      setCollectedCombinedImages((prev) => (prev.length < 4 ? [...prev, { imagePath, label }] : prev))
    } else {
      setCollectedCombinedTexts((prev) => [...prev, { text, label }])
    }
  }

  const handleRemoveFromCombinedImage = (index) => {
    setCollectedCombinedImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleRemoveFromCombinedText = (index) => {
    setCollectedCombinedTexts((prev) => prev.filter((_, i) => i !== index))
  }

  const handleClearCombined = () => {
    setCollectedCombinedImages([])
    setCollectedCombinedTexts([])
  }

  const handleCopyCombined = () => {
    copyCompositeImageWithMainImage(
      collectedCombinedImages.map((i) => i.imagePath),
      collectedCombinedTexts.map((i) => ({ text: i.text })),
      'combined-product.png'
    )
  }

  const hasCombinedItems = collectedCombinedImages.length > 0 || collectedCombinedTexts.length > 0

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Size Toggle Bar */}
      <div className="flex justify-center gap-2 mb-6">
        <button
          onClick={() => setSize('medium')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${size === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Medium
        </button>
        <button
          onClick={() => setSize('large')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${size === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Large
        </button>
        <button
          onClick={() => setSize('extraLarge')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${size === 'extraLarge' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Extra Large
        </button>
      </div>

      {/* Collection Box */}
      {collectedImages.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6 p-4 bg-white border-2 border-gray-200 rounded-lg shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">
              Collected ({collectedImages.length})
            </span>
            <div className="flex flex-1 overflow-x-auto gap-2 min-w-0">
              {collectedImages.map((item, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-12 h-12 md:w-16 md:h-16 rounded border-2 border-gray-200 overflow-hidden group"
                >
                  <img
                    src={item.imagePath}
                    alt={item.filename}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromCollection(index)}
                    className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from collection"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={handleCopyCollectedBulk}
                className="px-4 py-2 rounded-lg font-medium bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center gap-2"
                title="Copy all collected images as one"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy as bulk
              </button>
              <button
                onClick={handleClearCollection}
                className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                title="Clear collection"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading photos...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <button onClick={fetchProducts} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      ) : photoList.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No photos found</p>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4 text-center">{photoList.length} photos</p>
      )}

      {!loading && !error && photoList.length > 0 && (
        <div className="flex flex-wrap gap-2 md:gap-4">
          {photoList.map((item, index) => {
            const imagePath = getImagePath(item.photo)
            const photos = getProductPhotos(item.product)
            const photoIndex = photos.findIndex((p) => p === item.photo || getImagePath(p) === imagePath)
            const safePhotoIndex = photoIndex >= 0 ? photoIndex : 0
            return (
              <button
                key={index}
                type="button"
                onClick={() => openProductModal(item.product, safePhotoIndex)}
                className={`${sizeClass} relative flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden cursor-pointer p-0 border-0 text-left block`}
              >
                <img
                  src={imagePath}
                  alt={item.product.Name || 'Product'}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    e.target.classList.add('hidden')
                    const errDiv = e.target.parentElement?.querySelector('.img-error')
                    if (errDiv) errDiv.classList.remove('hidden')
                  }}
                />
                <div className="img-error hidden absolute inset-0 flex items-center justify-center bg-red-50 text-red-500 text-xs">
                  Error
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    copyImageToClipboard(imagePath, item.photo)
                  }}
                  className="absolute top-1 right-1 p-1.5 bg-blue-500/60 hover:bg-blue-600/90 text-white rounded shadow backdrop-blur-sm transition-colors"
                  title="Copy image"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddToCollection(imagePath, item.photo)
                  }}
                  className="absolute bottom-1 right-1 p-1.5 bg-amber-500/60 hover:bg-amber-600/90 text-white rounded shadow backdrop-blur-sm transition-colors"
                  title="Add to collection"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </button>
            )
          })}
        </div>
      )}

      {/* Product modal - Price 2 style */}
      {modalProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={closeProductModal}
        >
          <div
            className="relative bg-gray-50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between p-3 bg-white border-b border-gray-200 z-10">
              <Link
                to="/price2"
                className="px-4 py-2 rounded-lg font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-colors"
              >
                Open in Price 2
              </Link>
              <button
                type="button"
                onClick={closeProductModal}
                className="p-2 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"
                title="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-4 space-y-4">
              {hasCombinedItems && (
                <div className="p-4 bg-white border-2 border-cyan-200 rounded-lg shadow-sm">
                  <div className="flex flex-col gap-3 max-h-[200px] overflow-hidden">
                    <div className="flex items-center justify-between gap-3 flex-shrink-0">
                      <span className="text-sm font-medium text-gray-700">
                        Combined Collected ({collectedCombinedImages.length}/4 photo{collectedCombinedImages.length !== 1 ? 's' : ''} + {collectedCombinedTexts.length} text)
                      </span>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={handleCopyCombined}
                          className="px-4 py-2 rounded-lg font-medium bg-cyan-500 hover:bg-cyan-600 text-white transition-colors flex items-center gap-2"
                          title="Copy as composite image (photo + text)"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Copy & Send
                        </button>
                        <button
                          type="button"
                          onClick={handleClearCombined}
                          className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                          title="Clear combined collection"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                    <div className="flex overflow-x-scroll gap-2 pb-2 min-h-0 flex-1">
                      {collectedCombinedImages.map((item, index) => (
                        <div
                          key={`img-${index}`}
                          className="relative flex items-center gap-3 p-3 rounded border border-cyan-200 bg-cyan-50 flex-shrink-0 h-[100px]"
                        >
                          <img
                            src={item.imagePath}
                            alt=""
                            className="w-14 h-14 object-contain bg-white rounded border border-gray-200 flex-shrink-0"
                          />
                          <div className="text-sm text-gray-700 flex-1 min-w-0 truncate">{item.label}</div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCombinedImage(index)}
                            className="p-1.5 rounded hover:bg-red-100 text-red-500 transition-colors flex-shrink-0"
                            title="Remove photo"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {collectedCombinedTexts.map((item, index) => (
                        <div
                          key={`txt-${index}`}
                          className="relative flex flex-col gap-1 p-3 rounded border border-gray-200 bg-gray-50 flex-shrink-0 min-w-[180px] max-w-[180px] h-[100px]"
                        >
                          <div className="text-xs font-medium text-gray-700 truncate">{item.label}</div>
                          <div className="text-xs text-gray-600 line-clamp-2 mt-0.5 overflow-hidden">{item.text}</div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCombinedText(index)}
                            className="absolute top-2 right-2 p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                            title="Remove from collection"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <PriceProductCard
                product={modalProduct}
                initialSelectedImageIndex={modalPhotoIndex}
                hideCopyAndCollect
                onAddToCombined={handleAddToCombined}
                maxCombinedImagesReached={collectedCombinedImages.length >= 4}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GalleryPage
