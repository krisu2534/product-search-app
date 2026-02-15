/**
 * Combined collection: composite image (photo + text) for clipboard.
 * Used by Price 2 tab - can be removed if Price 2 is removed.
 */
async function loadImage(imagePath) {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const timeout = setTimeout(() => resolve(null), 10000)
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

function wrapText(ctx, text, maxWidth) {
  const lines = []
  const paragraphs = (text || '').split('\n')
  for (const para of paragraphs) {
    const words = para.split(' ')
    let line = ''
    for (const word of words) {
      const test = line ? `${line} ${word}` : word
      const m = ctx.measureText(test)
      if (m.width > maxWidth && line) {
        lines.push(line)
        line = word
      } else {
        line = test
      }
    }
    if (line) lines.push(line)
  }
  return lines
}

const COMPOSITE_PADDING = 20
const COMPOSITE_LINE_HEIGHT = 18
const COMPOSITE_CANVAS_WIDTH = 520
const COMPOSITE_IMG_MAX_HEIGHT = 340
const COMPOSITE_BLOCK_GAP = 10
const COMPOSITE_IMG_GRID_GAP = 8
const MAX_COMBINED_IMAGES = 4
const COMPOSITE_QUALITY_SCALE = 2

function drawCompositeItem(ctx, img, text, y, canvasWidth, imgMaxHeight = COMPOSITE_IMG_MAX_HEIGHT) {
  const padding = COMPOSITE_PADDING
  const lineHeight = COMPOSITE_LINE_HEIGHT
  const fontSize = 14

  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = '#333333'

  const scale = Math.min(1, (canvasWidth - padding * 2) / img.width)
  const imgW = img.width * scale
  const imgH = Math.min(img.height * scale, imgMaxHeight)

  ctx.drawImage(img, padding, y, imgW, imgH)
  let currentY = y + imgH + padding

  const textLines = wrapText(ctx, text, canvasWidth - padding * 2)
  for (const line of textLines) {
    ctx.fillText(line, padding, currentY + fontSize)
    currentY += lineHeight
  }

  return currentY + padding
}

/**
 * Draw an image scaled to fit within a cell, centered.
 */
function drawImageInCell(ctx, img, cellX, cellY, cellW, cellH) {
  const scale = Math.min(cellW / img.width, cellH / img.height, 1)
  const drawW = img.width * scale
  const drawH = img.height * scale
  const x = cellX + (cellW - drawW) / 2
  const y = cellY + (cellH - drawH) / 2
  ctx.drawImage(img, x, y, drawW, drawH)
}

/**
 * Draw up to 4 images. Layout adapts to count:
 * 1 image: full width, single row
 * 2 images: top row, left + right
 * 3 images: top row full + bottom left
 * 4 images: 2x2 grid
 */
function drawImageGrid(ctx, images, startY, canvasWidth, maxGridHeight) {
  const padding = COMPOSITE_PADDING
  const gap = COMPOSITE_IMG_GRID_GAP
  const gridWidth = canvasWidth - padding * 2
  const count = Math.min(images.length, MAX_COMBINED_IMAGES)

  let cellW, cellH, gridHeight
  if (count <= 2) {
    gridHeight = (maxGridHeight - gap) / 2
    cellW = count === 1 ? gridWidth : (gridWidth - gap) / 2
    cellH = gridHeight
  } else {
    gridHeight = maxGridHeight
    cellW = (gridWidth - gap) / 2
    cellH = (gridHeight - gap) / 2
  }

  const positions = [
    [padding, startY],
    [padding + cellW + gap, startY],
    [padding, startY + cellH + gap],
    [padding + cellW + gap, startY + cellH + gap]
  ]

  for (let i = 0; i < count; i++) {
    const [cellX, cellY] = positions[i]
    drawImageInCell(ctx, images[i], cellX, cellY, cellW, cellH)
  }

  return gridHeight
}

function drawTextOnly(ctx, text, y, canvasWidth) {
  const padding = COMPOSITE_PADDING
  const lineHeight = COMPOSITE_LINE_HEIGHT
  const fontSize = 14

  ctx.font = `${fontSize}px sans-serif`
  ctx.fillStyle = '#333333'

  const textLines = wrapText(ctx, text, canvasWidth - padding * 2)
  let currentY = y
  for (const line of textLines) {
    ctx.fillText(line, padding, currentY + fontSize)
    currentY += lineHeight
  }

  return currentY + padding
}

/**
 * Copy composite: one or more images + text items.
 * If no images, draws text items only.
 * @param {string|string[]} mainImagePaths - Path(s) to product image(s) - single path or array
 * @param {Array<{ text: string }>} textItems - Text-only items
 */
export async function copyCompositeImageWithMainImage(mainImagePaths, textItems, fallbackFilename = 'combined-product.png') {
  const canvasWidth = COMPOSITE_CANVAS_WIDTH
  const imgMaxHeight = COMPOSITE_IMG_MAX_HEIGHT
  const padding = COMPOSITE_PADDING
  const lineHeight = COMPOSITE_LINE_HEIGHT

  const imagePaths = Array.isArray(mainImagePaths) ? mainImagePaths : (mainImagePaths ? [mainImagePaths] : [])
  const pathsToLoad = imagePaths.slice(0, MAX_COMBINED_IMAGES)

  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvasWidth
  tempCanvas.height = 800
  const tempCtx = tempCanvas.getContext('2d')
  tempCtx.font = '14px sans-serif'

  let totalHeight = padding * 2
  const loadedImages = []

  for (const path of pathsToLoad) {
    const img = await loadImage(path)
    if (img) loadedImages.push(img)
  }

  let gridHeight = 0
  if (loadedImages.length > 0) {
    gridHeight = loadedImages.length <= 2 ? (imgMaxHeight - COMPOSITE_IMG_GRID_GAP) / 2 : imgMaxHeight
    totalHeight += gridHeight + padding
  }

  const itemCount = (textItems || []).length
  for (const item of textItems || []) {
    const text = item.text || ''
    const textHeight = wrapText(tempCtx, text, canvasWidth - padding * 2).length * lineHeight + padding
    totalHeight += textHeight
  }

  const blockGapCount = loadedImages.length > 0 ? itemCount : Math.max(0, itemCount - 1)
  totalHeight += blockGapCount * COMPOSITE_BLOCK_GAP
  totalHeight += padding

  if (totalHeight <= padding * 2) {
    alert('Nothing to copy. Add a photo and/or text items first.')
    return
  }

  const scale = COMPOSITE_QUALITY_SCALE
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth * scale
  canvas.height = totalHeight * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, totalHeight)

  let y = padding

  if (loadedImages.length > 0) {
    const drawnGridHeight = drawImageGrid(ctx, loadedImages, y, canvasWidth, imgMaxHeight)
    y += drawnGridHeight + padding
  }

  const items = textItems || []
  for (let i = 0; i < items.length; i++) {
    if (i > 0 || loadedImages.length > 0) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
      y += COMPOSITE_BLOCK_GAP
    }
    y = drawTextOnly(ctx, items[i].text || '', y, canvasWidth)
  }

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    alert('Failed to create composite image')
    return
  }

  const isSecureContext =
    window.isSecureContext ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    } catch (e) {
      console.warn('ClipboardItem failed:', e)
    }
  }

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isIOS) {
    showIOSCopyOverlay(dataUrl)
    return
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fallbackFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  alert('Image saved. Paste from your downloads if clipboard failed.')
}

function showIOSCopyOverlay(dataUrl) {
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
}

export async function copyCompositeImageToClipboard(items, fallbackFilename = 'combined-product.png') {
  if (!items?.length) {
    alert('No items to copy')
    return
  }

  const canvasWidth = COMPOSITE_CANVAS_WIDTH
  const imgMaxHeight = COMPOSITE_IMG_MAX_HEIGHT
  const segments = []

  for (const item of items) {
    const img = await loadImage(item.imagePath)
    if (!img) continue

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasWidth
    tempCanvas.height = 800
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.font = '14px sans-serif'
    const textHeight = wrapText(tempCtx, item.text || '', canvasWidth - COMPOSITE_PADDING * 2).length * COMPOSITE_LINE_HEIGHT + COMPOSITE_PADDING * 2
    const imgH = Math.min(img.height * Math.min(1, (canvasWidth - COMPOSITE_PADDING * 2) / img.width), imgMaxHeight)
    segments.push({ img, text: item.text || '', height: imgH + textHeight + COMPOSITE_PADDING * 2 })
  }

  if (segments.length === 0) {
    alert('Failed to load any images')
    return
  }

  const totalHeight = segments.reduce((sum, s) => sum + s.height, 0)
  const canvas = document.createElement('canvas')
  canvas.width = canvasWidth
  canvas.height = totalHeight
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvasWidth, totalHeight)

  let y = 0
  for (const seg of segments) {
    y = drawCompositeItem(ctx, seg.img, seg.text, y, canvasWidth, imgMaxHeight)
    if (seg !== segments[segments.length - 1]) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvasWidth, y)
      ctx.stroke()
      y += COMPOSITE_BLOCK_GAP
    }
  }

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png')
  })

  if (!blob) {
    alert('Failed to create composite image')
    return
  }

  const isSecureContext =
    window.isSecureContext ||
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  if (isSecureContext && typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
      return
    } catch (e) {
      console.warn('ClipboardItem failed:', e)
    }
  }

  const dataUrl = await new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })

  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
  if (isIOS) {
    showIOSCopyOverlay(dataUrl)
    return
  }

  const link = document.createElement('a')
  link.href = dataUrl
  link.download = fallbackFilename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  alert('Image saved. Paste from your downloads if clipboard failed.')
}
