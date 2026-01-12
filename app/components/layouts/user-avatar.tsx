import { ParsedResumeData } from "@/lib/resume"

export function UserAvatar({ data, className = "" }: { data: ParsedResumeData, className?: string }) {
    // 1. Try Resume Picture (Specific to this resume)
    // 2. Fallback to Initials

    const imageSrc = data.personal.picture
    const initials = data.personal.name
        ? data.personal.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()
        : "Me"

    if (imageSrc) {
        // We use a standard img tag for printing support (Next.js Image can be tricky with print)
        return (
            <img
                src={imageSrc}
                alt={data.personal.name}
                className={`object-cover object-top rounded-full ${className}`}
            />
        )
    }

    return (
        <div className={`flex items-center justify-center bg-slate-200 text-slate-600 font-bold rounded-full ${className}`}>
            {initials}
        </div>
    )
}