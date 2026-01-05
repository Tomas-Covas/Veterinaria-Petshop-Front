"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import img1 from "../../../assets/pedigree.jpeg"
import img2 from "../../../assets/dogWithGlases.jpg"
import img3 from "../../../assets/NavidadBanner.png"

const slides = [img1, img2, img3]

export default function Carousel() {
    const [index, setIndex] = useState(0)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const next = () => setIndex((p) => (p + 1) % slides.length)
    const prev = () =>
        setIndex((p) => (p - 1 + slides.length) % slides.length)
    const goTo = (i: number) => setIndex(i)

    useEffect(() => {
        timeoutRef.current = setTimeout(() => next(), 4000)
        return () => {
            timeoutRef.current && clearTimeout(timeoutRef.current)
        }
    }, [index])

    return (
        <div className="relative w-full h-60 md:h-80 rounded-lg overflow-hidden shadow-lg">

            {slides.map((img, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"
                        }`}
                >
                    <div className="relative w-full h-full">
                        <Image
                            src={img}
                            alt={`Slide ${i + 1}`}
                            fill
                            sizes="100vw"
                            className="object-cover"
                            loading="eager"
                        />
                    </div>
                </div>
            ))}

            {/* Prev Button */}
            <button
                onClick={prev}
                className="absolute top-1/2 left-3 -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 w-10 h-10 flex items-center justify-center rounded-full"
            >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            {/* Next Button */}
            <button
                onClick={next}
                className="absolute top-1/2 right-3 -translate-y-1/2 z-20 bg-white/40 hover:bg-white/60 w-10 h-10 flex items-center justify-center rounded-full"
            >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
                {slides.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => goTo(i)}
                        className={`w-3 h-3 rounded-full transition ${index === i ? "bg-orange-500" : "bg-gray-300"
                            }`}
                    />
                ))}
            </div>
        </div>
    )
}
