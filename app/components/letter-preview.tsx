import { Card } from "@/components/ui/card"

interface LetterPreviewProps {
  data: any
  layoutId?: string
}

export function LetterPreview({ data, layoutId = 'classic' }: LetterPreviewProps) {
  if (!data) return null

  // Distinguish between SOP (Essay style) and Cover Letter (Business Letter style)
  const isSOP = data.type === "sop"

  // Layout Classes
  const fontClass = layoutId === 'modern' ? 'font-sans' : (layoutId === 'minimal' ? 'font-sans' : 'font-serif')
  const containerClass = "w-full bg-white shadow-lg p-[15mm] md:p-[20mm] text-gray-800 leading-relaxed min-h-[297mm]"

  return (
    <div className={`${containerClass} ${fontClass} ${layoutId === 'modern' ? 'border-t-8 border-blue-600' : ''}`}>

      {/* --- HEADER (Cover Letter Only) --- */}
      {!isSOP && (
        <div className="mb-10 border-b border-gray-100 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide mb-2">
            {data.personalInfo?.fullName || "Your Name"}
          </h1>
          <div className="text-sm text-gray-500 flex flex-col gap-1">
            <p>{data.personalInfo?.email} • {data.personalInfo?.phone}</p>
            {data.personalInfo?.address && <p>{data.personalInfo?.address}</p>}
          </div>
        </div>
      )}

      {/* --- RECIPIENT INFO (Cover Letter Only) --- */}
      {!isSOP && (
        <div className="mb-8 text-sm text-gray-700">
          <p className="font-bold mb-4">{data.date}</p>

          <div className="space-y-0.5">
            <p className="font-bold">{data.recipientInfo?.managerName}</p>
            <p>{data.recipientInfo?.company}</p>
            <p>{data.recipientInfo?.address}</p>
          </div>
        </div>
      )}

      {/* --- SUBJECT LINE (Cover Letter Only) --- */}
      {!isSOP && data.subject && (
        <div className="mb-6 font-bold underline text-gray-900">
          RE: {data.subject}
        </div>
      )}

      {/* --- SOP TITLE (SOP Only) --- */}
      {isSOP && (
        <div className="mb-10 text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 uppercase underline decoration-2 underline-offset-4">
            {data.title || "Statement of Purpose"}
          </h1>
        </div>
      )}

      {/* --- SALUTATION --- */}
      {!isSOP && (
        <div className="mb-4 text-gray-900">
          {data.salutation}
        </div>
      )}

      {/* --- MAIN CONTENT (Paragraphs) --- */}
      <div className="space-y-4 text-justify text-[11pt] text-gray-800">
        {data.paragraphs?.map((para: string, index: number) => (
          <p key={index} className="leading-7">
            {para}
          </p>
        ))}
      </div>

      {/* --- SIGN OFF (Cover Letter Only) --- */}
      {!isSOP && (
        <div className="mt-10">
          <p>{data.signOff}</p>
          <br />
          <p className="font-bold text-gray-900">{data.personalInfo?.fullName}</p>
        </div>
      )}
    </div>
  )
}