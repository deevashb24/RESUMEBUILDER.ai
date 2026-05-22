import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Learn how to manage or cancel your ResumeBuilder.ai subscription and understand the billing cycle implications.",
}

export default function CancellationPolicyPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <>
            <h1>Cancellation Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>

            <p>
                This Cancellation Policy outlines how you can manage your subscription with <strong>ResumeBuilder.ai</strong>.
            </p>

            <h2>1. How to Cancel Your Subscription</h2>
            <p>
                You can cancel your subscription at any time. To do so, simply log into your account, navigate to your <strong>Dashboard</strong>, 
                and select "Manage Subscription" under your account settings. Follow the on-screen instructions to complete the cancellation.
            </p>

            <h2>2. Effect of Cancellation</h2>
            <p>
                When you cancel your subscription, the cancellation will take effect at the <strong>end of your current billing cycle</strong>. 
                You will not be charged for any subsequent billing periods. 
                You will retain access to all premium features until the current billing cycle expires.
            </p>

            <h2>3. Prorated Refunds</h2>
            <p>
                We do not provide prorated refunds for mid-cycle cancellations. If you cancel half-way through your month or year, 
                you will continue to have access for the remainder of that period, and no partial refund will be issued.
            </p>

            <h2>4. Account Deletion vs. Cancellation</h2>
            <p>
                Please note that deleting your account or uninstalling the application does <strong>not</strong> automatically cancel your subscription. 
                You must follow the formal cancellation process through our payment processor (such as Razorpay or Lemon Squeezy) to ensure you are not billed further.
            </p>

            <h2>5. Changes to Your Subscription</h2>
            <p>
                If you choose to upgrade or downgrade your subscription plan, the changes and new billing rates will be applied immediately or 
                at the start of the next billing cycle, depending on the terms provided at checkout.
            </p>

            <h2>6. Contact Us</h2>
            <p>
                If you experience any issues canceling your subscription or have further questions, please contact our support team at <a href="mailto:support@resumebuilder.ai">support@resumebuilder.ai</a>.
            </p>
        </>
    )
}
