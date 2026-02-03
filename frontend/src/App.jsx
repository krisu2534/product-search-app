import { useState, useEffect, useRef } from 'react'
import ProductCard from './components/ProductCard'

function App() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showPdf, setShowPdf] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(true)
  const [pdfError, setPdfError] = useState(false)
  const pdfSrcRef = useRef(null)
  const iframeRef = useRef(null)

  useEffect(() => {
    fetchProducts()
    
    // Detect mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera
      const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i
      const isMobileDevice = mobileRegex.test(userAgent.toLowerCase()) || window.innerWidth < 768
      setIsMobile(isMobileDevice)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => {
      window.removeEventListener('resize', checkMobile)
    }
  }, [])

  useEffect(() => {
    // Prevent body scroll when PDF modal is open
    if (showPdf) {
      document.body.style.overflow = 'hidden'
      // Lazy load PDF: only set src when modal opens
      if (!pdfSrcRef.current) {
        pdfSrcRef.current = "/combined handtools catalog/catalog.pdf"
        setPdfLoading(true)
        setPdfError(false)
      }
    } else {
      document.body.style.overflow = 'unset'
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showPdf])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredProducts(products)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product => {
        // Search across all product properties
        return Object.values(product).some(value => {
          if (Array.isArray(value)) {
            return value.some(item => 
              String(item).toLowerCase().includes(query)
            )
          }
          return String(value).toLowerCase().includes(query)
        })
      })
      setFilteredProducts(filtered)
    }
  }, [searchQuery, products])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      setProducts(data)
      setFilteredProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      setLoading(false)
    }
  }

  const handlePdfLoad = () => {
    setPdfLoading(false)
    setPdfError(false)
  }

  const handlePdfError = () => {
    setPdfLoading(false)
    setPdfError(true)
  }

  const handleClosePdf = () => {
    setShowPdf(false)
    // Reset loading state when closing, but keep src cached
    setPdfLoading(true)
    setPdfError(false)
  }


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Product Search & Copy
        </h1>
        
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            {/* PDF Catalog Button */}
            {isMobile ? (
              <a
                href="/combined handtools catalog/catalog.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center px-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg min-w-[60px]"
                title="Open Catalog PDF"
              >
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </a>
            ) : (
              <button
                onClick={() => setShowPdf(!showPdf)}
                className="flex items-center justify-center px-4 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg min-w-[60px]"
                title={showPdf ? "Close Catalog PDF" : "Open Catalog PDF"}
              >
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
                    d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* PDF Viewer Modal Popup - Desktop only */}
        {showPdf && !isMobile && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
            onClick={handleClosePdf}
          >
            <div 
              className="bg-white rounded-lg shadow-2xl overflow-hidden w-[95vw] h-[95vh] max-w-7xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3 bg-gray-100 border-b flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-800">Product Catalog</h2>
                <button
                  onClick={handleClosePdf}
                  className="text-gray-600 hover:text-gray-800 transition-colors p-1"
                  title="Close PDF"
                >
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
                </button>
              </div>
              <div className="relative w-full flex-1">
                {pdfLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                      <p className="mt-4 text-gray-600">Loading PDF...</p>
                    </div>
                  </div>
                )}
                {pdfError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="mt-4 text-gray-600">Failed to load PDF</p>
                      <button
                        onClick={() => {
                          setPdfError(false)
                          setPdfLoading(true)
                          if (iframeRef.current) {
                            iframeRef.current.src = pdfSrcRef.current + '?t=' + Date.now()
                          }
                        }}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
                {pdfSrcRef.current && (
                  <iframe
                    ref={iframeRef}
                    src={pdfSrcRef.current}
                    className="w-full h-full border-0"
                    title="Product Catalog PDF"
                    onLoad={handlePdfLoad}
                    onError={handlePdfError}
                    style={{ display: pdfLoading || pdfError ? 'none' : 'block' }}
                  />
                )}
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
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default App
