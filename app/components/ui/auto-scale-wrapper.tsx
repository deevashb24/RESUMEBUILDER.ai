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

            const containerHeight = containerRef.current.clientHeight
            const contentHeight = contentRef.current.scrollHeight

            // If content is taller than A4 (297mm), shrink it to fit
            if (contentHeight > containerHeight) {
                const newScale = containerHeight / contentHeight
                // Buffer of 0.98 to avoid cutting off bottom border
                setScale(newScale * 0.98)
            } else {
                setScale(1)
            }
        }

        handleResize()
        // Re-calculate if content changes (e.g. image loads)
        const observer = new ResizeObserver(handleResize)
        if (contentRef.current) observer.observe(contentRef.current)

        return () => observer.disconnect()
    }, [children])

    return (
        <div
            ref={containerRef}
            className="a4-page-container mx-auto origin-top"
        >
            <div
                ref={contentRef}
                style={{
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                    width: "100%",
                    // If content is short, let it fill height naturally
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