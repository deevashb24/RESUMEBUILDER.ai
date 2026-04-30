import React from "react"
import { Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface AddItemButtonProps {
    onClick: () => void
    label: string
    className?: string
}

export function AddItemButton({ onClick, label, className }: AddItemButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "print:hidden flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50/80 hover:bg-blue-100 hover:text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 shadow-sm transition-all opacity-70 hover:opacity-100",
                className
            )}
            title={`Add ${label}`}
        >
            <Plus className="w-3.5 h-3.5" />
            {label}
        </button>
    )
}

interface RemoveItemButtonProps {
    onClick: () => void
    className?: string
}

export function RemoveItemButton({ onClick, className }: RemoveItemButtonProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "print:hidden opacity-30 hover:opacity-100 absolute bg-white/80 backdrop-blur-sm shadow border border-red-100 top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-md transition-all z-20",
                className
            )}
            title="Delete Item"
        >
            <Trash2 className="w-4 h-4" />
        </button>
    )
}
