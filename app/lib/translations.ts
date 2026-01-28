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
        footer: {
            tagline: "Empowering job seekers with AI-driven resume optimization.",
            product: "Product",
            legal: "Legal"
        }
    },
    es: {
        nav: {
            generate: "Generar",
            history: "Historial",
            upgrade: "Mejorar a Pro",
            pro: "PRO"
        },
        footer: {
            tagline: "Empoderando a los solicitantes de empleo con optimización de currículum impulsada por IA.",
            product: "Producto",
            legal: "Legal"
        }
    },
    fr: {
        nav: {
            generate: "Générer",
            history: "Historique",
            upgrade: "Passer à Pro",
            pro: "PRO"
        },
        footer: {
            tagline: "Donner aux chercheurs d'emploi les moyens d'optimiser leur CV grâce à l'IA.",
            product: "Produit",
            legal: "Légal"
        }
    },
    de: {
        nav: {
            generate: "Generieren",
            history: "Verlauf",
            upgrade: "Upgrade auf Pro",
            pro: "PRO"
        },
        footer: {
            tagline: "Wir unterstützen Arbeitssuchende mit KI-gesteuerter Lebenslaufoptimierung.",
            product: "Produkt",
            legal: "Rechtliches"
        }
    },
    hi: {
        nav: {
            generate: "बनाएं",
            history: "इतिहास",
            upgrade: "प्रो में अपग्रेड करें",
            pro: "प्रो"
        },
        footer: {
            tagline: "एआई-संचालित बायोडाटा अनुकूलन के साथ नौकरी चाहने वालों को सशक्त बनाना।",
            product: "उत्पाद",
            legal: "कानूनी"
        }
    }
}

export function getTranslation(lang: Language) {
    return translations[lang] || translations['en']
}
