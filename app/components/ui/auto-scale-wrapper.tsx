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

            // A4 dimensions in pixels (approximate at 96 DPI)
            // We use the container's width to determine the baseline
            const containerHeight = containerRef.current.clientHeight
            const contentHeight = contentRef.current.scrollHeight

            // Logic: If content is taller than the page, scale it down.
            // If content is smaller, we keep scale at 1 (we don't stretch text, just layout).
            if (contentHeight > containerHeight) {
                const newScale = containerHeight / contentHeight
                // Add a tiny buffer (0.98) to prevent edge cutting
                setScale(newScale * 0.99)
            } else {
                setScale(1)
            }
        }

        // Run initially and set up observer for content changes
        handleResize()

        // Observer ensures if images load or data changes, we re-calc
        const observer = new ResizeObserver(handleResize)
        if (contentRef.current) observer.observe(contentRef.current)

        return () => observer.disconnect()
    }, [children])

    return (
        <div
            id="print-content-root" // Matches CSS ID
            className="a4-page-container mx-auto" // Matches CSS Class
            ref={containerRef}
        >
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    height: "100%",
                    width: "100%",
                    // Flex column ensures if content is small, footer can push down (if layout supports it)
                    display: "flex",
                    flexDirection: "column"
                }}
            >
                {children}
            </div>
        </div>
    )
}