import Link from "next/link"

export default function TermsPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <>
            <h1>Terms of Service</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>

            <p>
                Welcome to <strong>ResumeBuilder.ai</strong>. By accessing or using our website and services, you agree to be bound by these Terms of Service.
            </p>

            <h2>1. Acceptable Use</h2>
            <p>
                You agree to use our services only for lawful purposes. You must not:
            </p>
            <ul>
                <li>Generate fraudulent, misleading, or intentionally false documents.</li>
                <li>Use the service to infringe upon the intellectual property rights of others.</li>
                <li>Attempt to bypass or reverse-engineer our AI generation systems.</li>
            </ul>

            <h2>2. Pro Subscriptions</h2>
            <p>
                Certain features, such as premium layouts and unlimited generations, are available via "Pro" subscriptions or one-time purchases.
            </p>
            <ul>
                <li><strong>Billing:</strong> Fees are billed in advance and are non-refundable unless required by law.</li>
                <li><strong>Cancellation:</strong> You may cancel your subscription at any time; access remains valid until the end of the billing period.</li>
            </ul>

            <h2>3. Disclaimer of Warranties</h2>
            <p>
                <strong>ResumeBuilder.ai is a tool.</strong> We provide AI-assisted content generation but do not guarantee employment,
                job offers, or specific interview outcomes. The final accuracy and suitability of any generated document
                are your responsibility.
            </p>

            <h2>4. Limitation of Liability</h2>
            <p>
                To the maximum extent permitted by law, ResumeBuilder.ai shall not be liable for any indirect, incidental, or consequential damages
                arising from your use of the service.
            </p>

            <h2>5. Changes to Terms</h2>
            <p>
                We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of the new terms.
            </p>
        </>
    )
}
