'use client'

import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [videoGenerated, setVideoGenerated] = useState(false)
  const [selectedStyle, setSelectedStyle] = useState('melting')
  const [text, setText] = useState('Delicious Chocolate')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const styles = [
    { id: 'melting', name: '🍫 Melting Chocolate' },
    { id: 'splash', name: '💧 Chocolate Splash' },
    { id: 'pour', name: '🫗 Chocolate Pour' },
    { id: 'swirl', name: '🌀 Chocolate Swirl' },
  ]

  const generateVideo = () => {
    setIsGenerating(true)
    setVideoGenerated(false)

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = 1920
    canvas.height = 1080

    const mediaRecorder = setupMediaRecorder(canvas)
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      if (videoRef.current) {
        videoRef.current.src = url
        setVideoGenerated(true)
        setIsGenerating(false)
      }
    }

    mediaRecorder.start()
    animateVideo(ctx, canvas, selectedStyle, text, () => {
      setTimeout(() => mediaRecorder.stop(), 100)
    })
  }

  const setupMediaRecorder = (canvas: HTMLCanvasElement) => {
    const stream = canvas.captureStream(30)
    return new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9' })
  }

  const animateVideo = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    style: string,
    text: string,
    onComplete: () => void
  ) => {
    let frame = 0
    const totalFrames = 150

    const animate = () => {
      ctx.fillStyle = '#1a0f0a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const progress = frame / totalFrames

      switch (style) {
        case 'melting':
          drawMeltingChocolate(ctx, canvas, progress)
          break
        case 'splash':
          drawChocolateSplash(ctx, canvas, progress)
          break
        case 'pour':
          drawChocolatePour(ctx, canvas, progress)
          break
        case 'swirl':
          drawChocolateSwirl(ctx, canvas, progress)
          break
      }

      // Draw text
      const textOpacity = Math.min(1, progress * 2)
      ctx.save()
      ctx.globalAlpha = textOpacity
      ctx.fillStyle = '#d4a574'
      ctx.font = 'bold 120px Arial'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(text, canvas.width / 2, canvas.height / 2)
      ctx.restore()

      frame++
      if (frame < totalFrames) {
        requestAnimationFrame(animate)
      } else {
        onComplete()
      }
    }

    animate()
  }

  const drawMeltingChocolate = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    progress: number
  ) => {
    const drops = 8
    for (let i = 0; i < drops; i++) {
      const x = (canvas.width / (drops + 1)) * (i + 1)
      const startY = 100
      const endY = canvas.height * 0.8
      const currentY = startY + (endY - startY) * Math.pow(progress, 0.5)

      const gradient = ctx.createLinearGradient(x, startY, x, currentY)
      gradient.addColorStop(0, '#3d2817')
      gradient.addColorStop(0.5, '#5c3d2e')
      gradient.addColorStop(1, '#2d1810')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(x - 40, startY)
      ctx.bezierCurveTo(x - 60, currentY * 0.3, x - 50, currentY * 0.6, x - 30, currentY)
      ctx.bezierCurveTo(x - 20, currentY + 20, x + 20, currentY + 20, x + 30, currentY)
      ctx.bezierCurveTo(x + 50, currentY * 0.6, x + 60, currentY * 0.3, x + 40, startY)
      ctx.closePath()
      ctx.fill()
    }
  }

  const drawChocolateSplash = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    progress: number
  ) => {
    const splashCount = 12
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    for (let i = 0; i < splashCount; i++) {
      const angle = (Math.PI * 2 * i) / splashCount
      const distance = 300 * Math.pow(progress, 0.7)
      const x = centerX + Math.cos(angle) * distance
      const y = centerY + Math.sin(angle) * distance

      const size = 80 * (1 - progress * 0.5)

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size)
      gradient.addColorStop(0, '#5c3d2e')
      gradient.addColorStop(0.7, '#3d2817')
      gradient.addColorStop(1, 'rgba(45, 24, 16, 0)')

      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawChocolatePour = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    progress: number
  ) => {
    const pouringX = canvas.width / 2
    const startY = -100
    const endY = canvas.height * 0.7
    const currentY = startY + (endY - startY) * progress

    // Pouring stream
    const gradient = ctx.createLinearGradient(pouringX, startY, pouringX, currentY)
    gradient.addColorStop(0, '#5c3d2e')
    gradient.addColorStop(1, '#3d2817')

    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(pouringX - 30, startY)
    ctx.lineTo(pouringX - 40, currentY)
    ctx.lineTo(pouringX + 40, currentY)
    ctx.lineTo(pouringX + 30, startY)
    ctx.closePath()
    ctx.fill()

    // Pool at bottom
    if (currentY > canvas.height * 0.5) {
      const poolProgress = (currentY - canvas.height * 0.5) / (canvas.height * 0.2)
      const poolWidth = 400 * poolProgress

      ctx.fillStyle = '#3d2817'
      ctx.beginPath()
      ctx.ellipse(pouringX, endY, poolWidth, 60, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const drawChocolateSwirl = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    progress: number
  ) => {
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const spirals = 3

    for (let s = 0; s < spirals; s++) {
      ctx.beginPath()
      const offset = (Math.PI * 2 * s) / spirals

      for (let i = 0; i <= progress * 200; i++) {
        const angle = (i / 20) * Math.PI * 2 + offset
        const distance = i * 3
        const x = centerX + Math.cos(angle) * distance
        const y = centerY + Math.sin(angle) * distance

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.strokeStyle = s % 2 === 0 ? '#5c3d2e' : '#3d2817'
      ctx.lineWidth = 40
      ctx.lineCap = 'round'
      ctx.stroke()
    }
  }

  const downloadVideo = () => {
    if (videoRef.current && videoRef.current.src) {
      const a = document.createElement('a')
      a.href = videoRef.current.src
      a.download = `chocolate-video-${selectedStyle}-${Date.now()}.webm`
      a.click()
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-950 via-stone-900 to-amber-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold text-amber-100 mb-4">🍫 Chocolate Video Generator</h1>
          <p className="text-xl text-amber-200">Create stunning chocolate-themed videos instantly</p>
        </div>

        <div className="bg-stone-800 rounded-2xl shadow-2xl p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-amber-100 text-lg font-semibold mb-3">
                Enter Your Text
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-stone-700 text-amber-100 border-2 border-amber-700 focus:border-amber-500 focus:outline-none text-lg"
                placeholder="e.g., Delicious Chocolate"
                maxLength={30}
              />
            </div>

            <div>
              <label className="block text-amber-100 text-lg font-semibold mb-3">
                Choose Animation Style
              </label>
              <div className="grid grid-cols-2 gap-3">
                {styles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                      selectedStyle === style.id
                        ? 'bg-amber-600 text-white shadow-lg scale-105'
                        : 'bg-stone-700 text-amber-200 hover:bg-stone-600'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={generateVideo}
            disabled={isGenerating || !text.trim()}
            className="w-full mt-8 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-xl font-bold rounded-lg hover:from-amber-700 hover:to-amber-800 disabled:from-stone-600 disabled:to-stone-700 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
          >
            {isGenerating ? '🎬 Generating Video...' : '🎬 Generate Video'}
          </button>
        </div>

        {videoGenerated && (
          <div className="bg-stone-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-amber-100 mb-6 text-center">
              Your Chocolate Video is Ready! 🎉
            </h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden mb-6">
              <video
                ref={videoRef}
                controls
                className="w-full h-full"
                autoPlay
                loop
              />
            </div>
            <button
              onClick={downloadVideo}
              className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-xl font-bold rounded-lg hover:from-green-700 hover:to-green-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              ⬇️ Download Video
            </button>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </main>
  )
}
