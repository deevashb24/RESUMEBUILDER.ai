export type Language = 'en' | 'es' | 'fr' | 'de' | 'hi'

export const languages: { [key in Language]: string } = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    hi: "Hindi",
}

export const translations = {
    en: {
        nav: {
            generate: "Generate",
            history: "History",
            upgrade: "Upgrade to Pro",
            pro: "PRO"
        },
        dashboard: {
            uploadTitle: "Upload Document",
            uploadDesc: "Drag and drop your previous resume (PDF/DOCX)",
            jdTitle: "Job Description",
            jdPlaceholder: "Paste the job description or program details here...",
            layoutTitle: "Choose Layout",
            layoutDesc: "Select the design for your generated resume",
            generateTitle: "Generate",
            generateDesc: "Create your document",
            viewBtn: "View Result",
            generateBtn: "Generate"
        },
        // NEW: Resume Layout Headers (The text inside the PDF)
        resume: {
            personalInfo: "Personal Info",
            summary: "Professional Summary",
            experience: "Experience",
            education: "Education",
            projects: "Projects",
            skills: "Skills",
            languages: "Languages",
            tools: "Tools",
            contact: "Contact"
        },
        history: {
            title: "Your History",
            subtitle: "Access and download your previously generated documents.",
            loading: "Loading history...",
            emptyTitle: "No history yet",
            emptyDesc: "Generate your first document to see it here.",
            goDashboard: "Go to Dashboard",
            download: "Download PDF",
            unlock: "Unlock Document",
            locked: "Locked",
            unlocked: "Unlocked"
        },
        progress: {
            scanning: "Scanning Job Description...",
            analyzing: "Analyzing Keywords & Gaps...",
            grammar: "Checking Grammar & Originality...",
            finalizingResume: "Finalizing Resume Structure...",
            finalizingCover: "Finalizing Cover Letter...",
            finalizingSop: "Finalizing Statement of Purpose...",
            successTitle: "Document Generated!",
            successDesc: "We optimized your document for the highest success rate.",
            ats: "ATS Score",
            impact: "Impact",
            unique: "Originality"
        },
        legal: {
            privacyTitle: "Privacy Policy",
            termsTitle: "Terms of Service",
            lastUpdated: "Last Updated",
            backToDashboard: "Back to Dashboard"
        },
        footer: {
            tagline: "Empowering job seekers with AI-driven resume optimization.",
            product: "Product",
            legal: "Legal",
            contact: "Contact",
            madeWith: "Made with",
            byBuilders: "by Builders for Builders",
            links: {
                generate: "Generate Resume",
                history: "History",
                pricing: "Pricing",
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                cookies: "Cookie Policy"
            }
        }
    },
    hi: {
        nav: {
            generate: "बनाएं",
            history: "इतिहास",
            upgrade: "प्रो में अपग्रेड करें",
            pro: "प्रो"
        },
        dashboard: {
            uploadTitle: "दस्तावेज़ अपलोड करें",
            uploadDesc: "अपना पिछला बायोडाटा यहाँ खींचें (PDF/DOCX)",
            jdTitle: "नौकरी का विवरण",
            jdPlaceholder: "यहाँ नौकरी या कार्यक्रम का विवरण पेस्ट करें...",
            layoutTitle: "लेआउट चुनें",
            layoutDesc: "अपने बायोडाटा के लिए डिज़ाइन चुनें",
            generateTitle: "बनाएं",
            generateDesc: "अपना दस्तावेज़ तैयार करें",
            viewBtn: "परिणाम देखें",
            generateBtn: "बनाएं"
        },
        resume: {
            personalInfo: "व्यक्तिगत जानकारी",
            summary: "पेशेवर सारांश",
            experience: "अनुभव",
            education: "शिक्षा",
            projects: "परियोजनाएं",
            skills: "कौशल",
            languages: "भाषाएं",
            tools: "उपकरण",
            contact: "संपर्क"
        },
        history: {
            title: "आपका इतिहास",
            subtitle: "अपने पहले बनाए गए दस्तावेज़ों तक पहुंचें और डाउनलोड करें।",
            loading: "इतिहास लोड हो रहा है...",
            emptyTitle: "अभी कोई इतिहास नहीं है",
            emptyDesc: "इसे यहाँ देखने के लिए अपना पहला दस्तावेज़ बनाएं।",
            goDashboard: "डैशबोर्ड पर जाएं",
            download: "PDF डाउनलोड करें",
            unlock: "दस्तावेज़ अनलॉक करें",
            locked: "लॉक है",
            unlocked: "अनलॉक है"
        },
        progress: {
            scanning: "नौकरी विवरण स्कैन किया जा रहा है...",
            analyzing: "कीवर्ड और कमियों का विश्लेषण...",
            grammar: "व्याकरण और मौलिकता की जाँच...",
            finalizingResume: "बायोडाटा संरचना को अंतिम रूप दिया जा रहा है...",
            finalizingCover: "कवर लेटर को अंतिम रूप दिया जा रहा है...",
            finalizingSop: "SOP को अंतिम रूप दिया जा रहा है...",
            successTitle: "दस्तावेज़ तैयार है!",
            successDesc: "हमने उच्चतम सफलता दर के लिए आपके दस्तावेज़ को अनुकूलित किया है।",
            ats: "ATS स्कोर",
            impact: "प्रभाव",
            unique: "मौलिकता"
        },
        legal: {
            privacyTitle: "गोपनीयता नीति",
            termsTitle: "सेवा की शर्तें",
            lastUpdated: "अंतिम अपडेट",
            backToDashboard: "डैशबोर्ड पर वापस जाएं"
        },
        footer: {
            tagline: "एआई-संचालित बायोडाटा अनुकूलन के साथ नौकरी चाहने वालों को सशक्त बनाना।",
            product: "उत्पाद",
            legal: "कानूनी",
            contact: "संपर्क",
            madeWith: "द्वारा निर्मित",
            byBuilders: "बिल्डर्स के लिए",
            links: {
                generate: "बायोडाटा बनाएं",
                history: "इतिहास",
                pricing: "मूल्य निर्धारण",
                privacy: "गोपनीयता नीति",
                terms: "सेवा की शर्तें",
                cookies: "कुकी नीति"
            }
        }
    },
    // Add placeholders for others to avoid errors
    es: {} as any,
    fr: {} as any,
    de: {} as any
}

// Quick Helper to Fill Missing Languages (Copy English to others for safety)
translations.es = { ...translations.en }
translations.fr = { ...translations.en }
translations.de = { ...translations.en }

export function getTranslation(lang: Language) {
    return translations[lang] || translations['en']
}