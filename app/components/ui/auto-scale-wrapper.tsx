"use client"

import React, { useEffect, useRef, useState } from "react"

interface AutoScaleWrapperProps {
    children: React.ReactNode
}

export function AutoScaleWrapper({ children }: AutoScaleWrapperProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(1)

    useEffect(() => {
        const handleResize = () => {
            if (!containerRef.current || !contentRef.current) return

            // A4 dimensions
            const containerHeight = containerRef.current.clientHeight
            const contentHeight = contentRef.current.scrollHeight

            // If content is taller than the container, shrink it
            if (contentHeight > containerHeight) {
                const newScale = containerHeight / contentHeight
                // INCREASED BUFFER: 0.96 (4% margin) ensures it fits comfortably without 
                // touching the exact pixel edge, preventing "Double Page" glitch.
                setScale(newScale * 0.96)
            } else {
                setScale(1)
            }
        }

        handleResize()
        // Watch for content changes (e.g. images loading)
        const observer = new ResizeObserver(handleResize)
        if (contentRef.current) observer.observe(contentRef.current)

        return () => observer.disconnect()
    }, [children])

    return (
        <div
            ref={containerRef}
            className="a4-page-container mx-auto origin-top bg-white"
        >
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    width: "100%",
                    // If content is small, let it fill height naturally
                    height: scale === 1 ? "100%" : "auto",
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {children}
            </div>
        </div>
    )
}