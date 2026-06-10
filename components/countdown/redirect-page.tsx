"use client"

import Image from "next/image"
import { GlowOrbs } from "./glow-orbs"
import type { CountdownConfig } from "@/types/config"

interface RedirectPageProps {
  config: CountdownConfig
}

const BOTTOM_LOGOS = [
  { src: "/logos/AI_Robotic-01.png", alt: "AI & Robotic" },
  { src: "/logos/Khoa_CNTT-02.png", alt: "Khoa CNTT" },
  { src: "/logos/Lab_T&A-04.png", alt: "Lab T&A" },
  { src: "/logos/Media_T&A-05.png", alt: "Media T&A" },
]

export function RedirectPage({ config }: RedirectPageProps) {
  const redirects = config.redirects || []

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ backgroundColor: config.bgColor }}>
      <GlowOrbs accentColor={config.accentColor} />

      {/* Top Logo */}
      <div className="relative z-10 flex justify-center pt-2 sm:pt-4">
        <div className="relative w-[200px] h-[90px] sm:w-[360px] sm:h-[162px]">
          <Image
            src="/logos/LHU&ASU-03.png?v=2"
            alt="LHU & ASU"
            fill
            className="object-contain"
            sizes="(max-width: 640px) 200px, 360px"
            priority
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-4xl mx-auto w-full">
        <div className="flex flex-col items-center gap-8 sm:gap-12 w-full">
          {(config.redirectsTitle || config.title) && (
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white text-center uppercase tracking-tighter drop-shadow-md">
              {config.redirectsTitle || config.title}
            </h1>
          )}

          {/* Buttons Grid */}
          <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 px-4">
            {redirects.length === 0 ? (
              <p className="col-span-full text-center text-white/60 text-lg py-8">
                Chưa có liên kết nào được cấu hình
              </p>
            ) : (
              redirects.map((btn, index) => (
                <a
                  key={index}
                  href={btn.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center justify-between w-full px-6 py-4 sm:py-5 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 hover:border-[#ECC253]/80 text-white font-bold text-base sm:text-lg shadow-lg hover:shadow-black/20 hover:shadow-[0_0_20px_rgba(236,194,83,0.15)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 backdrop-blur-md"
                >
                  <span className="relative z-10 truncate pr-4 text-left group-hover:text-[#ECC253] transition-colors duration-300">
                    {btn.name}
                  </span>
                  
                  <span className="relative z-10 flex items-center justify-center shrink-0 w-8 h-8 rounded-full bg-white/10 group-hover:bg-[#ECC253] text-white group-hover:text-black transition-all duration-300 transform group-hover:translate-x-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </span>
                </a>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sponsor Logos */}
      <div className="relative z-10 flex justify-center pb-8 sm:pb-12 mt-8 sm:mt-16 px-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl px-6 py-4 sm:px-12 sm:py-6 flex flex-wrap justify-center gap-6 sm:gap-12 md:gap-20 items-center">
          {BOTTOM_LOGOS.map((logo) => (
            <div key={logo.src} className={`relative w-[80px] h-[60px] sm:w-[120px] sm:h-[90px] ${logo.src.includes('Khoa_CNTT') ? 'scale-[1.3]' : ''}`}>
              <Image
                src={logo.src}
                alt={logo.alt}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100px, 180px"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
