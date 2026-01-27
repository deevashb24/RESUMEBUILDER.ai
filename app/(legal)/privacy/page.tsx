import Link from "next/link"

export default function PrivacyPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <>
            <h1>Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>

            <p>
                At <strong>ResumeBuilder.ai</strong>, we value your privacy and are committed to protecting your personal data.
                This Privacy Policy explains how we collect, use, and safeguard your information when you use our AI-powered resume building services.
            </p>

            <h2>1. Information We Collect</h2>
            <p>We collect only the information necessary to provide our services:</p>
            <ul>
                <li><strong>Personal Information:</strong> Name, email address, and profile picture provided during authentication (via Google/Firebase).</li>
                <li><strong>Resume Data:</strong> Content from uploaded resumes (PDF/DOCX) or text input manually, including work history, education, and skills.</li>
                <li><strong>Usage Data:</strong> Anonymous analytics data to improve our service performance.</li>
            </ul>

            <h2>2. How We Use Your Data</h2>
            <p>Your data is used exclusively for:</p>
            <ul>
                <li><strong>AI Generation:</strong> Processing your resume data with our AI providers (OpenAI/Gemini) to generate optimized content. We do not use your data to train their models.</li>
                <li><strong>Service Functionality:</strong> Storing your generation history so you can access and edit past documents.</li>
                <li><strong>Communication:</strong> Sending transaction receipts or important service updates.</li>
            </ul>

            <h2>3. Data Storage & Security</h2>
            <p>
                We use <strong>Google Firebase</strong> for secure authentication and database storage.
                Calculated measures are in place to protect your data from unauthorized access.
            </p>

            <h2>4. Payments</h2>
            <p>
                We do not store your credit card information. All payments are processed securely by third-party payment processors
                (such as <strong>Razorpay</strong> or <strong>Lemon Squeezy</strong>), which adhere to PCI-DSS standards.
            </p>

            <h2>5. Your Rights & Control</h2>
            <p>
                You retain full ownership of your data. You can delete your generation history at any time through your dashboard.
                If you wish to delete your account entirely, please contact support.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you have questions about this policy, please contact us at <a href="mailto:support@resumebuilder.ai">support@resumebuilder.ai</a>.
            </p>
        </>
    )
}
