"use client"

import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { flushSync } from "react-dom"

interface EditableFieldProps {
    value: string
    onUpdate: (newValue: string) => void
    disabled?: boolean
    className?: string
    placeholder?: string
    multiline?: boolean
    as?: React.ElementType
    renderCustom?: React.ReactNode
}

/**
 * A reusable component that provides inline content-editable features.
 * When clicked, it allows text editing. It triggers onUpdate on blur or Enter (if not multiline).
 */
export function EditableField({
    value,
    onUpdate,
    disabled = false,
    className,
    placeholder = "Click to edit...",
    multiline = false,
    as: Component = "span",
    renderCustom,
    ...props
}: EditableFieldProps & React.HTMLAttributes<HTMLElement> & { href?: string, target?: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const elementRef = useRef<HTMLElement>(null)

    const handleBlur = () => {
        const newValue = elementRef.current?.textContent || ""
        setIsEditing(false)
        if (newValue !== value) {
            onUpdate(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!multiline && e.key === "Enter") {
            e.preventDefault()
            elementRef.current?.blur()
        }
    }

    const handleFocus = () => {
        if (disabled) return
        if (!isEditing) setIsEditing(true)
    }

    const handleClick = (e: React.MouseEvent) => {
        if (disabled) return
        e.stopPropagation()
        if (!isEditing) {
            e.preventDefault()
            // Force React to render the edit mode immediately to avoid slow response feel
            flushSync(() => {
                setIsEditing(true)
            })
            const el = elementRef.current
            if (el) {
                el.focus()
                // Place cursor at the end of the text instead of the beginning
                try {
                    const range = document.createRange()
                    const sel = window.getSelection()
                    range.selectNodeContents(el)
                    range.collapse(false) // false means end of content
                    sel?.removeAllRanges()
                    sel?.addRange(range)
                } catch (err) {}
            }
        }
    }

    const isEmpty = !value || value.trim() === ""

    const displayContent = isEditing
        ? value
        : (isEmpty ? <span className="print:hidden opacity-70">{placeholder}</span> : (renderCustom || value))

    const href = (Component === "a" && (props as any).href) ? (props as any).href : undefined;
    const target = (Component === "a" && (props as any).target) ? (props as any).target : undefined;

    return (
        <Component
            key={isEditing ? "edit" : "view"}
            ref={elementRef as any}
            contentEditable={!disabled && isEditing}
            suppressContentEditableWarning={true}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            href={href}
            target={target}
            className={cn(
                "outline-none transition-colors border border-transparent rounded-[2px]",
                !disabled && "hover:bg-blue-50/50 hover:border-blue-200/50 cursor-text",
                isEditing && "bg-blue-50/50 border-blue-300 ring-1 ring-blue-300 shadow-sm z-10 relative whitespace-pre-wrap",
                isEmpty && !isEditing && "text-gray-400 italic print:hidden",
                className
            )}
        >
            {displayContent}
        </Component>
    )
}
