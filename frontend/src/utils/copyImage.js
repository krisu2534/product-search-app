/**
 * Copy an image from a URL to the clipboard.
 * Handles mobile (iOS/Android), desktop, and fallbacks for HTTP.
 * @param {string} imagePath - Full path to image (e.g. '/images/photo.jpg')
 * @param {string} fallbackFilename - Filename for download fallback
 */
export async function copyImageToClipboard(imagePath, fallbackFilename = 'product-image.png') {
  if (!imagePath) {
    alert('No image available to copy')
    return
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  try {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Image load timeout')), 10000)
      img.onload = () => {
        clearTimeout(timeout)
        resolve()
      }
      img.onerror = () => {
        clearTimeout(timeout)
        reject(new Error(`Failed to load image: ${imagePath}`))
      }
      img.src = imagePath
    })

    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    ctx.drawImage(img, 0, 0)

    const blob = await new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })

    if (!blob) {
      throw new Error('Failed to create image blob')
    }

    if (isMobile) {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })

      if (isIOS) {
        const overlay = document.createElement('div')
        overlay.style.cssText = `
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0, 0, 0, 0.9); z-index: 9999;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          flex-direction: column;
        `
        const imageContainer = document.createElement('div')
        imageContainer.style.cssText = 'max-width: 100%; max-height: 100%; position: relative;'
        const displayImg = document.createElement('img')
        displayImg.src = dataUrl
        displayImg.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; -webkit-user-select: all; user-select: all;'
        const instruction = document.createElement('div')
        instruction.style.cssText = 'color: white; text-align: center; margin-top: 20px; font-size: 16px; padding: 10px;'
        instruction.textContent = 'Long-press the image to copy, then paste into LINE'
        const closeBtn = document.createElement('button')
        closeBtn.textContent = '✕ Close'
        closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 15px; border-radius: 5px; font-size: 16px; cursor: pointer;'
        closeBtn.onclick = () => document.body.removeChild(overlay)
        imageContainer.appendChild(displayImg)
        imageContainer.appendChild(closeBtn)
        overlay.appendChild(imageContainer)
        overlay.appendChild(instruction)
        document.body.appendChild(overlay)
        setTimeout(() => { if (document.body.contains(overlay)) document.body.removeChild(overlay) }, 10000)
        return
      }

      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
          return
        } catch (e) {
          console.warn('ClipboardItem API failed on mobile:', e)
        }
      }
    }

    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        return
      } catch (e) {
        console.warn('ClipboardItem API failed, trying fallback:', e)
      }
    }

    try {
      const dataUrl = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(blob)
      })
      const tempImg = document.createElement('img')
      tempImg.src = dataUrl
      tempImg.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;'
      const container = document.createElement('div')
      container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;'
      container.contentEditable = true
      container.appendChild(tempImg)
      document.body.appendChild(container)
      await new Promise((resolve) => { tempImg.complete ? resolve() : (tempImg.onload = tempImg.onerror = resolve) })
      const range = document.createRange()
      range.selectNodeContents(container)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      const success = document.execCommand('copy')
      selection.removeAllRanges()
      document.body.removeChild(container)
      if (success) return
    } catch (e) {
      console.warn('Fallback copy method failed:', e)
    }

    if (!isMobile) {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fallbackFilename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error copying image:', error)
    alert(`Failed to copy image: ${error.message}\n\nThe image file may not exist or cannot be loaded.`)
  }
}

/**
 * Load an image and return its HTMLImageElement, or null if it fails.
 */
function loadImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const timeout = setTimeout(() => {
      resolve(null)
    }, 10000)
    img.onload = () => {
      clearTimeout(timeout)
      resolve(img)
    }
    img.onerror = () => {
      clearTimeout(timeout)
      resolve(null)
    }
    img.src = imagePath
  })
}

/**
 * Copy multiple images combined into one (stacked vertically) to clipboard.
 * Skips images that fail to load; copies the rest. Alerts only if all fail.
 * @param {string[]} imagePaths - Array of image paths (e.g. from getImagePath)
 * @param {string} fallbackFilename - Filename for download fallback
 */
export async function copyImagesToClipboardBulk(imagePaths, fallbackFilename = 'product-images.png') {
  if (!imagePaths?.length) {
    alert('No images available to copy')
    return
  }

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)

  const loadedImages = []
  for (const path of imagePaths) {
    const img = await loadImage(path)
    if (img) {
      loadedImages.push(img)
    }
  }

  if (loadedImages.length === 0) {
    alert(`Failed to load any of ${imagePaths.length} image(s).\n\nPlease check that the files exist in the images folder.`)
    return
  }

  const totalWidth = Math.max(...loadedImages.map((img) => img.width))
  const totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0)

  const canvas = document.createElement('canvas')
  canvas.width = totalWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')
  let y = 0
  for (const img of loadedImages) {
    ctx.drawImage(img, 0, y, img.width, img.height)
    y += img.height
  }

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    alert('Failed to create combined image')
    return
  }

  if (isMobile) {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })

    if (isIOS) {
      const overlay = document.createElement('div')
      overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.9); z-index: 9999;
        display: flex; align-items: center; justify-content: center; padding: 20px;
        flex-direction: column;
      `
      const imageContainer = document.createElement('div')
      imageContainer.style.cssText = 'max-width: 100%; max-height: 100%; position: relative;'
      const displayImg = document.createElement('img')
      displayImg.src = dataUrl
      displayImg.style.cssText = 'max-width: 100%; max-height: 100%; object-fit: contain; -webkit-user-select: all; user-select: all;'
      const instruction = document.createElement('div')
      instruction.style.cssText = 'color: white; text-align: center; margin-top: 20px; font-size: 16px; padding: 10px;'
      instruction.textContent = 'Long-press the image to copy, then paste into LINE'
      const closeBtn = document.createElement('button')
      closeBtn.textContent = '✕ Close'
      closeBtn.style.cssText = 'position: absolute; top: 10px; right: 10px; background: rgba(255,255,255,0.2); color: white; border: none; padding: 10px 15px; border-radius: 5px; font-size: 16px; cursor: pointer;'
      closeBtn.onclick = () => document.body.removeChild(overlay)
      imageContainer.appendChild(displayImg)
      imageContainer.appendChild(closeBtn)
      overlay.appendChild(imageContainer)
      overlay.appendChild(instruction)
      document.body.appendChild(overlay)
      setTimeout(() => { if (document.body.contains(overlay)) document.body.removeChild(overlay) }, 10000)
      return
    }

    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
        if (loadedImages.length < imagePaths.length) {
          alert(`Copied ${loadedImages.length} of ${imagePaths.length} images (${imagePaths.length - loadedImages.length} failed to load).`)
        }
        return
      } catch (e) {
        console.warn('ClipboardItem API failed on mobile:', e)
      }
    }
  }

  const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      if (loadedImages.length < imagePaths.length) {
        alert(`Copied ${loadedImages.length} of ${imagePaths.length} images (${imagePaths.length - loadedImages.length} failed to load).`)
      }
      return
    } catch (e) {
      console.warn('ClipboardItem API failed, trying fallback:', e)
    }
  }

  try {
    const dataUrl = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.readAsDataURL(blob)
    })
    const tempImg = document.createElement('img')
    tempImg.src = dataUrl
    tempImg.style.cssText = 'position:fixed;left:-9999px;top:-9999px;width:1px;height:1px;'
    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;left:-9999px;top:-9999px;'
    container.contentEditable = true
    container.appendChild(tempImg)
    document.body.appendChild(container)
    await new Promise((resolve) => { tempImg.complete ? resolve() : (tempImg.onload = tempImg.onerror = resolve) })
    const range = document.createRange()
    range.selectNodeContents(container)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    const success = document.execCommand('copy')
    selection.removeAllRanges()
    document.body.removeChild(container)
    if (success) {
      if (loadedImages.length < imagePaths.length) {
        alert(`Copied ${loadedImages.length} of ${imagePaths.length} images (${imagePaths.length - loadedImages.length} failed to load).`)
      }
      return
    }
  } catch (e) {
    console.warn('Fallback copy method failed:', e)
  }

  if (!isMobile) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fallbackFilename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    if (loadedImages.length < imagePaths.length) {
      alert(`Downloaded ${loadedImages.length} of ${imagePaths.length} images (${imagePaths.length - loadedImages.length} failed to load).`)
    }
  }
}
