import { useState } from 'react'

const ZOOM_WIDTH = 320
const ZOOM_HEIGHT = 320
const OFFSET = 16

function ImageWithZoom({ src, alt, children, className = '' }) {
  const [showZoom, setShowZoom] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e) => {
    if (src) {
      setShowZoom(true)
      setPos({ x: e.clientX, y: e.clientY })
    }
  }

  const handleMouseMove = (e) => {
    setPos({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setShowZoom(false)
  }

  // Position popup near cursor, keep within viewport
  const popupLeft = Math.min(
    Math.max(pos.x + OFFSET, 8),
    window.innerWidth - ZOOM_WIDTH - 24
  )
  const popupTop = Math.min(
    Math.max(pos.y - ZOOM_HEIGHT / 2, 8),
    window.innerHeight - ZOOM_HEIGHT - 24
  )

  return (
    <div
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {showZoom && src && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: popupLeft,
            top: popupTop,
          }}
        >
          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-2">
            <img
              src={src}
              alt={alt}
              className="object-contain"
              style={{ maxWidth: ZOOM_WIDTH, maxHeight: ZOOM_HEIGHT }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageWithZoom
