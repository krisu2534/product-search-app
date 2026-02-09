import { useState, useEffect } from 'react'
import ProductCard from './components/ProductCard'

function App() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchProducts()
  }, [])

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
      setError(null)
      
      // Try the proxy first (works when accessing from same machine or via proxy)
      let apiUrl = '/api/products'
      
      // If accessing from network IP and proxy fails, try direct backend URL
      const isNetworkAccess = window.location.hostname !== 'localhost' && 
                             window.location.hostname !== '127.0.0.1'
      
      console.log('Fetching products from:', apiUrl, { isNetworkAccess, hostname: window.location.hostname })
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Don't throw on HTTP errors, we'll handle them
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error Response:', { status: response.status, statusText: response.statusText, body: errorText })
        throw new Error(`HTTP ${response.status}: ${response.statusText || 'Failed to fetch products'}`)
      }
      
      const data = await response.json()
      
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format: expected an array')
      }
      
      console.log('Products loaded successfully:', data.length, 'items')
      setProducts(data)
      setFilteredProducts(data)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching products:', error)
      
      let errorMessage = error.message || 'Failed to fetch products.'
      
      // Provide more helpful error messages
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please check if the backend server is running on port 3001.'
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to backend server. Please ensure:\n1. Backend server is running on port 3001\n2. Both frontend and backend servers are started'
      } else if (error.message.includes('404')) {
        errorMessage = 'API endpoint not found. Please check if the backend server is running correctly.'
      }
      
      setError(errorMessage)
      setLoading(false)
    }
  }


  // Debug: Log when component renders
  useEffect(() => {
    console.log('App component rendered', { 
      loading, 
      error, 
      productsCount: products.length,
      hostname: window.location.hostname,
      protocol: window.location.protocol,
      port: window.location.port
    })
  })

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
          </div>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <h3 className="font-semibold text-red-800 mb-1">Connection Error</h3>
                <p className="text-red-700 text-sm mb-2">{error}</p>
                <button
                  onClick={fetchProducts}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                >
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
