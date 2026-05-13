export default function RefundPolicyPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <>
            <h1>Refund Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>

            <p>
                At <strong>ResumeBuilder.ai</strong>, we want to ensure you are satisfied with our services. 
                Please read our refund policy carefully before making any purchases.
            </p>

            <h2>1. One-Time Purchases (Single Document Unlocks)</h2>
            <p>
                Due to the immediate digital nature of our generated documents (resumes, cover letters, and SOPs), 
                <strong>one-time purchases are strictly non-refundable</strong> once the document has been successfully generated or downloaded. 
                If you encounter a technical issue preventing you from downloading or generating your document, please contact our support team immediately.
            </p>

            <h2>2. Subscription Plans</h2>
            <p>
                If you have purchased a subscription, you may request a refund within <strong>7 days</strong> of your initial purchase 
                provided you have <strong>not</strong> generated or downloaded any premium documents during that period. 
                After 7 days, or if you have utilized the premium features, no refunds will be issued.
            </p>

            <h2>3. Renewal Charges</h2>
            <p>
                We do not offer refunds for automatic subscription renewals. It is your responsibility to cancel your subscription 
                before the renewal date to avoid being charged for the next billing cycle.
            </p>

            <h2>4. Failed or Unauthorized Transactions</h2>
            <p>
                If a charge appears on your account that was unauthorized or processed in error, please contact us within 30 days 
                so we can investigate and issue a refund if appropriate.
            </p>

            <h2>5. Contact Us for Refunds</h2>
            <p>
                To request a refund or if you have any questions regarding this policy, please contact us at <a href="mailto:support@resumebuilder.ai">support@resumebuilder.ai</a>.
            </p>
        </>
    )
}
