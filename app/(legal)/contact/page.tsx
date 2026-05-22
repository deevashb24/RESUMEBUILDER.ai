import Link from "next/link"
import { Mail, MessageCircle, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us | ResumeBuilder.ai",
  description: "Get in touch with the ResumeBuilder.ai team.",
}

export default function ContactPage() {
  return (
    <>
      <h1>Contact Us</h1>
      <p>
        Have a question, found a bug, or just want to say hello? We'd love to hear from you.
        The ResumeBuilder.ai team typically responds within 1–2 business days.
      </p>

      <h2>Email Support</h2>
      <p>
        For general inquiries, billing questions, or technical issues, reach us at{" "}
        <a href="mailto:help.resumebuilder.ai@gmail.com">help.resumebuilder.ai@gmail.com</a>.
      </p>

      <h2>What to Include</h2>
      <p>To help us resolve your issue quickly, please include:</p>
      <ul>
        <li>Your account email address</li>
        <li>A clear description of the issue or question</li>
        <li>Any relevant screenshots or error messages</li>
        <li>The document type you were working on (Resume, Cover Letter, SOP)</li>
      </ul>

      <h2>Response Times</h2>
      <ul>
        <li><strong>General inquiries:</strong> 1–2 business days</li>
        <li><strong>Technical issues:</strong> Within 24 hours</li>
        <li><strong>Billing & subscription:</strong> Within 24 hours</li>
      </ul>

      <h2>Feature Requests</h2>
      <p>
        We actively build based on user feedback. If you have a feature request or an idea to improve
        ResumeBuilder.ai, send us an email with the subject line <strong>"Feature Request"</strong>.
        We read every one.
      </p>

      <h2>Privacy Concerns</h2>
      <p>
        For privacy-related inquiries, data deletion requests, or GDPR concerns, please review our{" "}
        <Link href="/privacy">Privacy Policy</Link> and then contact us at the email above
        with the subject line <strong>"Privacy Request"</strong>.
      </p>
    </>
  )
}
