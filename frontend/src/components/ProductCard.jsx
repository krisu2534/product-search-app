import { useState } from 'react'

function ProductCard({ product }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [thumbnailErrors, setThumbnailErrors] = useState({})
  
  // Helper function to ensure photo filename has extension
  const ensurePhotoExtension = (filename) => {
    if (!filename || filename.length === 0) return filename;
    const trimmed = String(filename).trim();
    // Check if filename has an extension (contains a dot followed by letters/numbers at the end)
    if (!trimmed.match(/\.[a-zA-Z0-9]+$/)) {
      // No extension found, add .jpg
      return trimmed + '.jpg';
    }
    return trimmed;
  };

  // Ensure Photo is an array and clean up filenames
  const photos = Array.isArray(product.Photo) 
    ? product.Photo.map(photo => ensurePhotoExtension(photo)).filter(photo => photo && photo.length > 0)
    : product.Photo 
      ? [ensurePhotoExtension(product.Photo)].filter(photo => photo && photo.length > 0)
      : []
  
  // Debug: Log photo filenames for troubleshooting
  if (photos.length > 1) {
    console.log(`Product ${product.ID || product.id || 'unknown'}:`, {
      photoCount: photos.length,
      photos: photos,
      photoPaths: photos.map(p => `/images/${p}`)
    })
  }
  
  const currentImage = photos[selectedImageIndex] || null
  const imagePath = currentImage ? `/images/${currentImage}` : null

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

  const copyImageToClipboard = async () => {
    if (!imagePath) {
      alert('No image available to copy')
      return
    }

    if (imageLoadError) {
      alert(`Cannot copy image: The image file "${currentImage}" could not be loaded.\n\nPlease check:\n1. The file exists in the images folder\n2. The filename matches exactly (including spaces and special characters)\n3. The file is not corrupted`)
      return
    }

    // Detect mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

    try {
      // Create an image element to load the image
      const img = new Image()
      img.crossOrigin = 'anonymous'
      
      // Wait for image to load with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Image load timeout'))
        }, 10000) // 10 second timeout
        
        img.onload = () => {
          clearTimeout(timeout)
          resolve()
        }
        img.onerror = (err) => {
          clearTimeout(timeout)
          reject(new Error(`Failed to load image: ${imagePath}`))
        }
        img.src = imagePath
      })

      // Create a canvas and draw the image
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      // Convert canvas to PNG blob
      const blob = await new Promise((resolve) => {
        canvas.toBlob(resolve, 'image/png')
      })

      if (!blob) {
        throw new Error('Failed to create image blob')
      }

      // For mobile devices, use a different approach
      if (isMobile) {
        // Convert blob to data URL
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })

        // For iOS: Create a visible, selectable image that users can long-press to copy
        if (isIOS) {
          // Create a full-screen overlay with the image
          const overlay = document.createElement('div')
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.9);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          `
          
          const imageContainer = document.createElement('div')
          imageContainer.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            position: relative;
          `
          
          const displayImg = document.createElement('img')
          displayImg.src = dataUrl
          displayImg.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            -webkit-user-select: all;
            user-select: all;
          `
          
          const instruction = document.createElement('div')
          instruction.style.cssText = `
            color: white;
            text-align: center;
            margin-top: 20px;
            font-size: 16px;
            padding: 10px;
          `
          instruction.textContent = 'Long-press the image to copy, then paste into LINE'
          
          const closeBtn = document.createElement('button')
          closeBtn.textContent = '✕ Close'
          closeBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
          `
          closeBtn.onclick = () => {
            document.body.removeChild(overlay)
          }
          
          imageContainer.appendChild(displayImg)
          imageContainer.appendChild(closeBtn)
          overlay.appendChild(imageContainer)
          overlay.appendChild(instruction)
          document.body.appendChild(overlay)
          
          // Auto-dismiss after 10 seconds
          setTimeout(() => {
            if (document.body.contains(overlay)) {
              document.body.removeChild(overlay)
            }
          }, 10000)
          
          return
        }

        // For Android: Try ClipboardItem API first
        const isSecureContext = window.isSecureContext || 
                                window.location.protocol === 'https:' ||
                                window.location.hostname === 'localhost' ||
                                window.location.hostname === '127.0.0.1'

        if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
          try {
            const clipboardItem = new ClipboardItem({ 'image/png': blob })
            await navigator.clipboard.write([clipboardItem])
            return
          } catch (clipboardError) {
            console.warn('ClipboardItem API failed on mobile:', clipboardError)
          }
        }
      }

      // Desktop: Check if we're on HTTPS or localhost (ClipboardItem API works)
      const isSecureContext = window.isSecureContext || 
                              window.location.protocol === 'https:' ||
                              window.location.hostname === 'localhost' ||
                              window.location.hostname === '127.0.0.1'

      // Try modern ClipboardItem API first (works on HTTPS/localhost)
      if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          const clipboardItem = new ClipboardItem({ 'image/png': blob })
          await navigator.clipboard.write([clipboardItem])
          // Image copied successfully - no popup needed
          return
        } catch (clipboardError) {
          console.warn('ClipboardItem API failed, trying fallback:', clipboardError)
        }
      }

      // Fallback for HTTP/network: Try using canvas to clipboard via data URL
      try {
        // Convert blob to data URL
        const dataUrl = await new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(blob)
        })

        // Create a temporary image element
        const tempImg = document.createElement('img')
        tempImg.src = dataUrl
        tempImg.style.position = 'fixed'
        tempImg.style.left = '-9999px'
        tempImg.style.top = '-9999px'
        tempImg.style.width = '1px'
        tempImg.style.height = '1px'
        
        // Create a temporary container
        const container = document.createElement('div')
        container.style.position = 'fixed'
        container.style.left = '-9999px'
        container.style.top = '-9999px'
        container.contentEditable = true
        container.appendChild(tempImg)
        document.body.appendChild(container)

        // Wait for image to load
        await new Promise((resolve) => {
          if (tempImg.complete) {
            resolve()
          } else {
            tempImg.onload = resolve
            tempImg.onerror = resolve // Continue even if error
          }
        })

        // Select the image
        const range = document.createRange()
        range.selectNodeContents(container)
        const selection = window.getSelection()
        selection.removeAllRanges()
        selection.addRange(range)

        // Try to copy using execCommand (works on HTTP)
        const success = document.execCommand('copy')
        
        // Cleanup
        selection.removeAllRanges()
        document.body.removeChild(container)

        if (success) {
          // Image copied successfully - no popup needed
          return
        }
      } catch (fallbackError) {
        console.warn('Fallback copy method failed:', fallbackError)
      }

      // Last resort: Download the image (desktop only)
      if (!isMobile) {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = currentImage || 'product-image.png'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Error copying image:', error)
      alert(`Failed to copy image: ${error.message}\n\nThe image file "${currentImage}" may not exist or cannot be loaded.`)
    }
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
              <img
                src={imagePath}
                alt={product.Name || 'Product image'}
                className="w-full h-full object-contain"
                onLoad={handleMainImageLoad}
                onError={handleMainImageError}
              />
            )}
            {/* Copy Button */}
            <button
              onClick={copyImageToClipboard}
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
            const thumbnailPath = `/images/${photo}`
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
