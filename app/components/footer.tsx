"use client"

import Link from "next/link"
import { Github } from "lucide-react"
import { useLanguage } from "@/lib/language-context"

export function Footer() {
    const currentYear = new Date().getFullYear()
    const { t } = useLanguage()

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
                            {t.footer.tagline}
                        </p>
                        <div className="mt-6 flex gap-4">
                            {/* X (Twitter) */}
                            <a href="https://x.com/your-profile" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all" aria-label="X (Twitter)">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.045 4.126H5.078z" />
                                </svg>
                            </a>

                            {/* GitHub */}
                            <a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-full transition-all" aria-label="GitHub">
                                <Github className="w-5 h-5" />
                            </a>

                            {/* Reddit */}
                            <a href="https://reddit.com/u/your-username" target="_blank" rel="noopener noreferrer" className="p-2 text-muted-foreground hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all" aria-label="Reddit">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.249-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">{t.footer.product}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.generate}</Link></li>
                            <li><Link href="/history" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.history}</Link></li>
                            <li><Link href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.pricing}</Link></li>
                        </ul>
                    </div>

                    {/* Legal Section */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">{t.footer.legal}</h3>
                        <ul className="space-y-3">
                            <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.privacy}</Link></li>
                            <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.terms}</Link></li>
                            <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t.footer.links.cookies}</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / Contact */}
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">{t.footer.contact}</h3>
                        <p className="text-sm text-muted-foreground mb-4">Questions? We're here to help.</p>
                        <a href="mailto:support@resumebuilder.ai" className="inline-flex items-center text-sm font-medium text-primary hover:underline">
                            support@resumebuilder.ai
                        </a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        &copy; {currentYear} ResumeBuilder.ai. All rights reserved.
                    </p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{t.footer.madeWith}</span>
                        <svg className="w-3 h-3 text-red-500 fill-current" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>
                        <span>{t.footer.byBuilders}</span>
                    </div>
                </div>
            </div>
        </footer>
    )
}