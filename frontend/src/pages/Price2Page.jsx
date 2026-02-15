import { useState, useEffect, useRef } from 'react'
import PriceProductCard from '../components/PriceProductCard'
import { copyCompositeImageWithMainImage } from '../utils/copyCompositeImage'

const STATUS_KEY = 'สถานะ'

function Price2Page() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [collectedCombinedImages, setCollectedCombinedImages] = useState([])
  const [collectedCombinedTexts, setCollectedCombinedTexts] = useState([])
  const statusDropdownRef = useRef(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  useEffect(() => {
    const closeDropdown = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('click', closeDropdown)
    return () => document.removeEventListener('click', closeDropdown)
  }, [])

  useEffect(() => {
    let filtered = products

    if (statusFilter) {
      filtered = filtered.filter((p) => String(p[STATUS_KEY] || '').trim() === statusFilter)
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((product) => {
        return Object.values(product).some((value) => {
          if (Array.isArray(value)) {
            return value.some((item) =>
              String(item).toLowerCase().includes(query)
            )
          }
          return String(value).toLowerCase().includes(query)
        })
      })
    }

    setFilteredProducts(filtered)
  }, [searchQuery, statusFilter, products])

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

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', { status: response.status, body: errorText })
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Failed to fetch products'}`)
      }

      const data = await response.json()
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array')
      }

      setProducts(data)
      setFilteredProducts(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching products:', err)
      let errorMessage = err.message || 'Failed to fetch products.'
      if (err.name === 'AbortError' || err.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check if the backend server is running on port 3001.'
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to backend server. Please ensure:\n1. Backend server is running on port 3001\n2. Both frontend and backend servers are started'
      } else if (err.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check if the backend server is running correctly.'
      }
      setError(errorMessage)
      setLoading(false)
    }
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
    <div className="container mx-auto px-2 md:px-4 py-8 max-w-full">
      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative flex items-center gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all pr-12"
            />
            <svg
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <div className="relative" ref={statusDropdownRef}>
            <button
              onClick={() => setStatusDropdownOpen((o) => !o)}
              className={`flex items-center justify-center px-4 py-4 rounded-lg transition-all duration-200 shadow-md min-w-[60px] ${
                statusFilter
                  ? 'bg-amber-500 hover:bg-amber-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
              }`}
              title="Filter by สถานะ (Status)"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </button>
            {statusDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 py-2 min-w-[180px] bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <button
                  onClick={() => {
                    setStatusFilter('')
                    setStatusDropdownOpen(false)
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${!statusFilter ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'}`}
                >
                  ทั้งหมด (All)
                </button>
                {[...new Set(products.map((p) => p[STATUS_KEY]).filter(Boolean))].sort().map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(String(status))
                      setStatusDropdownOpen(false)
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 ${statusFilter === status ? 'bg-blue-50 font-medium text-blue-700' : 'text-gray-700'}`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
          <a
            href="/combined handtools catalog/catalog.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center px-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg min-w-[60px]"
            title="Open Catalog PDF"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </a>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Combined Collected - fixed height, horizontal scroll */}
      {hasCombinedItems && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-white border-2 border-cyan-200 rounded-lg shadow-sm">
          <div className="flex flex-col gap-3 max-h-[200px] overflow-hidden">
            <div className="flex items-center justify-between gap-3 flex-shrink-0">
              <span className="text-sm font-medium text-gray-700">
                Combined Collected ({collectedCombinedImages.length}/4 photo{collectedCombinedImages.length !== 1 ? 's' : ''} + {collectedCombinedTexts.length} text)
              </span>
              <div className="flex gap-2 flex-shrink-0">
                <button
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
                  key={index}
                  className="relative flex items-center gap-3 p-3 rounded border border-cyan-200 bg-cyan-50 flex-shrink-0 h-[100px]"
                >
                  <img
                    src={item.imagePath}
                    alt=""
                    className="w-14 h-14 object-contain bg-white rounded border border-gray-200 flex-shrink-0"
                  />
                  <div className="text-sm text-gray-700 flex-1 min-w-0 truncate">{item.label}</div>
                  <button
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
                  key={index}
                  className="relative flex flex-col gap-1 p-3 rounded border border-gray-200 bg-gray-50 flex-shrink-0 min-w-[180px] max-w-[180px] h-[100px]"
                >
                  <div className="text-xs font-medium text-gray-700 truncate">{item.label}</div>
                  <div className="text-xs text-gray-600 line-clamp-2 mt-0.5 overflow-hidden">{item.text}</div>
                  <button
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

      {/* Error Message */}
      {error && (
        <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800 mb-1">Connection Error</h3>
              <p className="text-red-700 text-sm mb-2">{error}</p>
              <button onClick={fetchProducts} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors">
                Retry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : error ? null : filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 w-full max-w-full md:max-w-4xl md:mx-auto">
          {filteredProducts.slice(0, 10).map((product, index) => (
            <PriceProductCard
              key={product.ID ?? product.id ?? index}
              product={product}
              onAddToCombined={handleAddToCombined}
              maxCombinedImagesReached={collectedCombinedImages.length >= 4}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Price2Page
