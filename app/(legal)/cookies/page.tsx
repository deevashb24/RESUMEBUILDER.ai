import Link from "next/link"

export default function CookiesPage() {
    const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    return (
        <>
            <h1>Cookie Policy</h1>
            <p className="text-sm text-muted-foreground">Last Updated: {lastUpdated}</p>

            <p>
                This Cookie Policy explains how <strong>ResumeBuilder.ai</strong> uses cookies and similar technologies to identify you when you visit our website.
            </p>

            <h2>1. What are Cookies?</h2>
            <p>
                Cookies are small data files placed on your computer or mobile device when you visit a website.
                They are widely used to make websites work more efficiently and provide reporting information.
            </p>

            <h2>2. How We Use Cookies</h2>
            <p>We use cookies for the following purposes:</p>
            <ul>
                <li><strong>Essential Cookies:</strong> These are strictly necessary for the website to function (e.g., maintaining your logged-in session via Supabase Authentication).</li>
                <li><strong>Performance & Analytics:</strong> We use aggregated, anonymous data (via Vercel Analytics) to understand how users interact with our app and improve performance.</li>
            </ul>

            <h2>3. Managing Cookies</h2>
            <p>
                Most web browsers allow you to control cookies through their settings preferences.
                However, if you limit the ability of websites to set cookies, you may worsen your overall user experience,
                and you will not be able to log in to our service.
            </p>

            <h2>4. Third-Party Cookies</h2>
            <p>
                In addition to our own cookies, we may also use various third-parties (such as Google or payment processors)
                to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
            </p>
        </>
    )
}
