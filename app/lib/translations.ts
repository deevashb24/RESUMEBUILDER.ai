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
            jdTitle: "Job Description / Requirements",
            jdPlaceholder: "Paste the JD or Program Details here...",
            layoutTitle: "Choose Layout",
            layoutDesc: "Select the design for your generated resume",
            generateTitle: "Generate",
            generateDesc: "Create your document",
            viewResult: "View Result",
            generateBtn: "Generate",
            generating: "Generating...",
            viewBtn: "View Result"
        },
        footer: {
            tagline: "Empowering job seekers with AI-driven resume optimization.",
            product: "Product",
            legal: "Legal",
            contact: "Contact",
            links: {
                generate: "Generate Resume",
                history: "History",
                pricing: "Pricing",
                privacy: "Privacy Policy",
                terms: "Terms of Service",
                cookies: "Cookie Policy"
            },
            madeWith: "Made with",
            byBuilders: "by Builders for Builders"
        }
    },
    es: {
        nav: {
            generate: "Generar",
            history: "Historial",
            upgrade: "Mejorar a Pro",
            pro: "PRO"
        },
        dashboard: {
            uploadTitle: "Subir Documento",
            uploadDesc: "Arrastra y suelta tu currículum anterior (PDF/DOCX)",
            jdTitle: "Descripción del Trabajo",
            jdPlaceholder: "Pega aquí la descripción del puesto...",
            layoutTitle: "Elegir Diseño",
            layoutDesc: "Selecciona el diseño para tu currículum",
            generateTitle: "Generar",
            generateDesc: "Crea tu documento",
            viewResult: "Ver Resultado",
            generateBtn: "Generar",
            generating: "Generando...",
            viewBtn: "Ver Resultado"
        },
        footer: {
            tagline: "Empoderando a los solicitantes de empleo con IA.",
            product: "Producto",
            legal: "Legal",
            contact: "Contacto",
            links: {
                generate: "Generar Currículum",
                history: "Historial",
                pricing: "Precios",
                privacy: "Política de Privacidad",
                terms: "Términos de Servicio",
                cookies: "Política de Cookies"
            },
            madeWith: "Hecho con",
            byBuilders: "por Constructores para Constructores"
        }
    },
    fr: {
        nav: {
            generate: "Générer",
            history: "Historique",
            upgrade: "Passer à Pro",
            pro: "PRO"
        },
        dashboard: {
            uploadTitle: "Télécharger un document",
            uploadDesc: "Glissez et déposez votre ancien CV (PDF/DOCX)",
            jdTitle: "Description du poste",
            jdPlaceholder: "Collez la description du poste ici...",
            layoutTitle: "Choisir la mise en page",
            layoutDesc: "Sélectionnez le design de votre CV",
            generateTitle: "Générer",
            generateDesc: "Créez votre document",
            viewResult: "Voir le résultat",
            generateBtn: "Générer",
            generating: "Génération...",
            viewBtn: "Voir le résultat"
        },
        footer: {
            tagline: "Optimisation de CV propulsée par l'IA.",
            product: "Produit",
            legal: "Légal",
            contact: "Contact",
            links: {
                generate: "Générer un CV",
                history: "Historique",
                pricing: "Tarifs",
                privacy: "Politique de confidentialité",
                terms: "Conditions d'utilisation",
                cookies: "Politique de cookies"
            },
            madeWith: "Fait avec",
            byBuilders: "par des Bâtisseurs pour des Bâtisseurs"
        }
    },
    de: {
        nav: {
            generate: "Generieren",
            history: "Verlauf",
            upgrade: "Upgrade auf Pro",
            pro: "PRO"
        },
        dashboard: {
            uploadTitle: "Dokument hochladen",
            uploadDesc: "Ziehen Sie Ihren alten Lebenslauf hierher (PDF/DOCX)",
            jdTitle: "Stellenbeschreibung",
            jdPlaceholder: "Fügen Sie hier die Stellenbeschreibung ein...",
            layoutTitle: "Layout wählen",
            layoutDesc: "Wählen Sie das Design für Ihren Lebenslauf",
            generateTitle: "Generieren",
            generateDesc: "Erstellen Sie Ihr Dokument",
            viewResult: "Ergebnis ansehen",
            generateBtn: "Generieren",
            generating: "Generieren...",
            viewBtn: "Ergebnis ansehen"
        },
        footer: {
            tagline: "KI-gesteuerte Lebenslaufoptimierung.",
            product: "Produkt",
            legal: "Rechtliches",
            contact: "Kontakt",
            links: {
                generate: "Lebenslauf erstellen",
                history: "Verlauf",
                pricing: "Preise",
                privacy: "Datenschutz",
                terms: "Nutzungsbedingungen",
                cookies: "Cookie-Richtlinie"
            },
            madeWith: "Gemacht mit",
            byBuilders: "von Buildern für Builder"
        }
    },
    hi: {
        nav: {
            generate: "बनाएं",
            history: "इतिहास",
            upgrade: "अपग्रेड करें",
            pro: "प्रो"
        },
        dashboard: {
            uploadTitle: "दस्तावेज़ अपलोड करें",
            uploadDesc: "अपना पुराना बायोडाटा यहाँ डालें (PDF/DOCX)",
            jdTitle: "नौकरी का विवरण",
            jdPlaceholder: "यहाँ नौकरी या प्रोग्राम का विवरण पेस्ट करें...",
            layoutTitle: "लेआउट चुनें",
            layoutDesc: "अपने बायोडाटा के लिए डिज़ाइन चुनें",
            generateTitle: "बनाएं",
            generateDesc: "अपना दस्तावेज़ तैयार करें",
            viewResult: "परिणाम देखें",
            generateBtn: "बनाएं",
            generating: "बन रहा है...",
            viewBtn: "परिणाम देखें"
        },
        footer: {
            tagline: "एआई के साथ अपने बायोडाटा को बेहतर बनाएं।",
            product: "उत्पाद",
            legal: "कानूनी",
            contact: "संपर्क",
            links: {
                generate: "बायोडाटा बनाएं",
                history: "इतिहास",
                pricing: "मूल्य निर्धारण",
                privacy: "गोपनीयता नीति",
                terms: "सेवा की शर्तें",
                cookies: "कुकी नीति"
            },
            madeWith: "द्वारा निर्मित",
            byBuilders: "बिल्डर्स के लिए"
        }
    }
}

export function getTranslation(lang: Language) {
    return translations[lang] || translations['en']
}