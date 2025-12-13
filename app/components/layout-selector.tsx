"use client"

import { Card, CardContent } from "@/components/ui/card"
import { LAYOUTS } from "@/lib/layouts"

interface LayoutSelectorProps {
  selectedLayout: string | null
  onSelectLayout: (layoutId: string) => void
  recommendedLayout?: string | null
}

export function LayoutSelector({
  selectedLayout,
  onSelectLayout,
  recommendedLayout,
}: LayoutSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Choose Resume Layout</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {LAYOUTS.map((layout) => {
          const isSelected = selectedLayout === layout.id
          const isRecommended = recommendedLayout === layout.id

          return (
            <div
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className="cursor-pointer"
            >
              <Card
                className={`transition-all border-2 ${
                  isSelected
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                } ${isRecommended && !isSelected ? "ring-2 ring-yellow-400/50" : ""}`}
              >
                <CardContent className="p-4">
                <div className="relative aspect-[3/4] w-full mb-3 bg-muted rounded-md overflow-hidden">
                  {/* Placeholder for layout preview - replace with actual images */}
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                    {layout.name}
                  </div>
                  {/* Uncomment when you have preview images:
                  <Image
                    src={layout.preview}
                    alt={layout.name}
                    fill
                    className="object-cover"
                  />
                  */}
                </div>
                <div>
                  <h4 className="font-semibold text-sm">{layout.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {layout.description}
                  </p>
                  {isRecommended && (
                    <span className="inline-block mt-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Recommended
                    </span>
                  )}
                  {isSelected && (
                    <span className="inline-block mt-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                      Selected
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
            </div>
          )
        })}
      </div>
    </div>
  )
}

