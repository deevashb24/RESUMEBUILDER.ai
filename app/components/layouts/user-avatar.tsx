import { ParsedResumeData } from "@/lib/resume"

interface UserAvatarProps {
    data: ParsedResumeData
    className?: string
}

export function UserAvatar({ data, className = "" }: UserAvatarProps) {
    const { name, picture } = data.personal || { name: "" }

    if (picture) {
        return (
            <img
                src={picture}
                alt={name}
                className={`object-cover ${className}`}
            // Fallback to initials on error could be added, but minimal img tag is safer for print
            />
        )
    }

    // Generate Initials
    const initials = name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()

    return (
        <div className={`flex items-center justify-center font-bold text-white bg-indigo-600 print:!bg-indigo-600 print-color-adjust-exact ${className}`}>
            {initials || "ME"}
        </div>
    )
}
