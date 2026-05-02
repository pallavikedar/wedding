'use client'

import { useEffect, useRef, useState } from 'react'

interface ParallaxImage {
  id: string
  src: string
  speed: number
  x: number
  y: number
  width: number
  height: number
}

export default function WeddingInvitation() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [parallaxOffsets, setParallaxOffsets] = useState<{ [key: string]: number }>({})

  const images: ParallaxImage[] = [
    { id: 'img1', src: '/wedding-11.svg', speed: 0.3, x: 5, y: 10, width: 120, height: 140 },
    { id: 'img2', src: '/wedding-12.svg', speed: 0.5, x: 75, y: 20, width: 140, height: 160 },
    { id: 'img3', src: '/wedding-13.svg', speed: 0.2, x: 10, y: 50, width: 100, height: 130 },
    { id: 'img4', src: '/wedding-14.svg', speed: 0.6, x: 70, y: 60, width: 150, height: 170 },
    { id: 'img5', src: '/wedding-15.svg', speed: 0.4, x: 40, y: 15, width: 110, height: 145 },
  ]

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current
        const totalScroll = scrollHeight - clientHeight
        const progress = totalScroll > 0 ? scrollTop / totalScroll : 0
        setScrollProgress(progress)

        // Calculate parallax offsets
        const newOffsets: { [key: string]: number } = {}
        images.forEach((img) => {
          newOffsets[img.id] = scrollTop * img.speed
        })
        setParallaxOffsets(newOffsets)
      }
    }

    const container = containerRef.current
    container?.addEventListener('scroll', handleScroll)
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen overflow-y-scroll bg-gradient-to-b from-amber-50 via-rose-50 to-amber-50 scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      {/* Fixed Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-rose-200 opacity-20 blur-3xl" />
        <div className="absolute bottom-40 right-10 w-40 h-40 rounded-full bg-amber-200 opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-pink-100 opacity-10 blur-3xl" />
      </div>

      {/* Parallax Images Container */}
      <div className="fixed inset-0 pointer-events-none">
        {images.map((img) => (
          <div
            key={img.id}
            className="absolute"
            style={{
              left: `${img.x}%`,
              top: `${img.y}%`,
              transform: `translateY(${parallaxOffsets[img.id] || 0}px)`,
              width: `${img.width}px`,
              height: `${img.height}px`,
            }}
          >
            <img
              src={img.src}
              alt="Wedding decoration"
              className="w-full h-full object-contain opacity-80 hover:opacity-100 transition-opacity duration-500"
            />
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Hero Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 text-center">
          <div
            className="transform transition-all duration-700"
            style={{
              opacity: 1 - Math.max(0, scrollProgress * 3),
              transform: `translateY(${Math.max(0, scrollProgress * 100)}px)`,
            }}
          >
            <h1 className="text-6xl md:text-7xl font-serif text-rose-900 mb-4 font-bold">
              Together
            </h1>
            <p className="text-xl md:text-2xl text-rose-700 font-light mb-6">
              Join us in celebrating
            </p>
            <div className="h-1 w-16 bg-gradient-to-r from-rose-400 to-amber-400 mx-auto" />
          </div>
        </section>

        {/* Couple Names Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="space-y-6">
            <h2 className="text-5xl md:text-6xl font-serif text-rose-900">
              Sarah & James
            </h2>
            <p className="text-lg text-rose-700 font-light max-w-2xl">
              We request the honor of your presence as we begin our journey together
            </p>
          </div>
        </section>

        {/* Details Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6">
          <div className="bg-white bg-opacity-70 backdrop-blur-sm rounded-3xl p-12 max-w-2xl shadow-2xl">
            <h3 className="text-3xl font-serif text-rose-900 mb-8 text-center">
              Wedding Details
            </h3>

            <div className="space-y-8">
              <div className="border-l-4 border-rose-400 pl-6">
                <h4 className="text-rose-900 font-semibold text-lg mb-2">Date & Time</h4>
                <p className="text-gray-700">
                  Saturday, June 15th, 2024
                  <br />
                  Four o'clock in the afternoon
                </p>
              </div>

              <div className="border-l-4 border-amber-400 pl-6">
                <h4 className="text-rose-900 font-semibold text-lg mb-2">Venue</h4>
                <p className="text-gray-700">
                  Garden Manor Estate
                  <br />
                  1234 Riverside Drive, California
                </p>
              </div>

              <div className="border-l-4 border-rose-400 pl-6">
                <h4 className="text-rose-900 font-semibold text-lg mb-2">Reception</h4>
                <p className="text-gray-700">
                  Dinner and dancing to follow
                  <br />
                  Under the stars
                </p>
              </div>
            </div>

            <button className="mt-10 w-full py-3 bg-gradient-to-r from-rose-400 to-amber-400 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              RSVP Now
            </button>
          </div>
        </section>

        {/* Closing Section */}
        <section className="h-screen flex flex-col items-center justify-center px-6 text-center">
          <div className="space-y-8">
            <h3 className="text-4xl md:text-5xl font-serif text-rose-900">
              With love & joy
            </h3>
            <p className="text-gray-700 text-lg max-w-xl">
              Your presence is the greatest gift we could ask for on our special day.
            </p>

            <div className="flex justify-center gap-4 mt-8">
              <div className="w-12 h-1 bg-gradient-to-r from-rose-400 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-rose-400" />
              <div className="w-12 h-1 bg-gradient-to-l from-rose-400 to-transparent" />
            </div>

            <p className="text-gray-600 text-sm mt-12">
              Scroll to explore • Made with love
            </p>
          </div>
        </section>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20 animate-bounce">
        <div className="text-rose-600 text-center">
          <p className="text-xs font-light mb-2">Scroll</p>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="fixed right-6 top-1/2 transform -translate-y-1/2 z-20">
        <div className="w-1 h-32 bg-rose-200 rounded-full overflow-hidden">
          <div
            className="w-full bg-gradient-to-b from-rose-400 to-amber-400 transition-all duration-300"
            style={{ height: `${scrollProgress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
