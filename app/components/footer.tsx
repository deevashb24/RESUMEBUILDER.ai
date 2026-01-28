"use client"

import Link from "next/link"
import { ShieldCheck, Mail, Github, Twitter, MessageSquare } from "lucide-react"

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-card/50 mt-auto">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="font-semibold text-foreground text-lg">
                            ResumeBuilder<span className="text-primary">.ai</span>
                        </Link>
                        <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                            Empowering job seekers with AI-driven resume optimization and professional cover letter generation.
                        </p>
                        <div className="mt-6 flex gap-4">
                            {/* X (Formerly Twitter) */}
                            <a href="https://x.com/your-profile" className="text-muted-foreground hover:text-primary transition-colors">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" /></svg>
                            </a>

                            {/* GitHub */}
                            <a href="https://github.com/your-username" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="w-5 h-5" />
                            </a>

                            {/* Reddit */}
                            <a href="https://reddit.com/u/your-username" className="text-muted-foreground hover:text-primary transition-colors">
                                <MessageSquare className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Product</h3>
                        <ul className="space-y-3">
                            <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">Generate Resume</Link></li>
                            <li><Link href="/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">History</Link></li>
                            <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">Legal</h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-muted-foreground">
                        © {currentYear} ResumeBuilder.ai. Built with precision for the modern career.
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-green-500" />
                        Secure & Encrypted
                    </div>
                </div>
            </div>
        </footer>
    )
}