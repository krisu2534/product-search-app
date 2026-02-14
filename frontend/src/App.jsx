import { useEffect } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import SearchPage from './pages/SearchPage'
import GalleryPage from './pages/GalleryPage'
import PricePage from './pages/PricePage'
import Price2Page from './pages/Price2Page'
import { hapticFeedback, playTapSound } from './utils/haptic'

function App() {
  useEffect(() => {
    const handlePointerDown = (e) => {
      const target = e.target.closest('button, a, [role="button"], [data-haptic]')
      if (target) {
        hapticFeedback()
        playTapSound()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 py-4">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }
            >
              Search
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }
            >
              Gallery
            </NavLink>
            <NavLink
              to="/price"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }
            >
              Price
            </NavLink>
            <NavLink
              to="/price2"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg font-medium transition-colors ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`
              }
            >
              Price 2
            </NavLink>
          </div>
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/price" element={<PricePage />} />
        <Route path="/price2" element={<Price2Page />} />
      </Routes>
    </div>
  )
}

export default App
